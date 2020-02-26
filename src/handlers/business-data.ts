import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Container, Contracts, Utils as AppUtils } from "@arkecosystem/core-kernel";
import { BusinessDataTransaction } from "../transactions";
import { Models } from "@arkecosystem/core-database";
import { IBusinessData } from "../interfaces";
import { BusinessAlreadyHasData } from "../errors";
import { BusinessData } from "../events";

@Container.injectable()
export class BusinessDataHandler extends Handlers.TransactionHandler {
    @Container.inject(Container.Identifiers.TransactionPoolQuery)
    private readonly poolQuery!: Contracts.TransactionPool.Query;

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public getConstructor(): Transactions.TransactionConstructor {
        return BusinessDataTransaction;
    }

    public async isActivated(): Promise<boolean> {
        return true;
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["businessData"];
    }

    public async bootstrap(): Promise<void> {
        const reader: TransactionReader = this.getTransactionReader();
        const transactions: Models.Transaction[] = await reader.read();

        for (const transaction of transactions) {
            const wallet: Contracts.State.Wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);
            const asset: IBusinessData = {
                ...transaction.asset.businessData,
            };
            wallet.setAttribute<IBusinessData>("businessData", asset);
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        sender: Contracts.State.Wallet,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        if (sender.hasAttribute("businessData")) {
            throw new BusinessAlreadyHasData();
        }
        return super.throwIfCannotBeApplied(transaction, sender, customWalletRepository);
    }

    public async throwIfCannotEnterPool(transaction: Interfaces.ITransaction): Promise<void> {
        AppUtils.assert.defined<string>(transaction.data.senderPublicKey);

        const hasSender: boolean = this.poolQuery
            .getAllBySender(transaction.data.senderPublicKey)
            .whereKind(transaction)
            .has();

        if (hasSender) {
            throw new Contracts.TransactionPool.PoolError(
                `Business data already in the pool`,
                "ERR_PENDING",
                transaction,
            );
        }
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
        emitter.dispatch(BusinessData, transaction.data);
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        await super.applyToSender(transaction, customWalletRepository);

        const walletRepository: Contracts.State.WalletRepository = customWalletRepository ?? this.walletRepository;

        AppUtils.assert.defined<string>(transaction.data.senderPublicKey);

        const sender: Contracts.State.Wallet = walletRepository.findByPublicKey(transaction.data.senderPublicKey);

        AppUtils.assert.defined<IBusinessData>(transaction.data.asset?.businessData);

        sender.setAttribute<IBusinessData>("businessData", {
            ...transaction.data.asset.businessRegistration,
        });
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        await super.revertForSender(transaction, customWalletRepository);

        const walletRepository: Contracts.State.WalletRepository = customWalletRepository ?? this.walletRepository;

        AppUtils.assert.defined<string>(transaction.data.senderPublicKey);

        const sender: Contracts.State.Wallet = walletRepository.findByPublicKey(transaction.data.senderPublicKey);

        sender.forgetAttribute("businessData");
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
        // tslint:disable-next-line: no-empty
    ): Promise<void> {}

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
        // tslint:disable-next-line:no-empty
    ): Promise<void> {}
}
