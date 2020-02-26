import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions } from "@arkecosystem/crypto";
import { Container, Contracts } from "@arkecosystem/core-kernel";
import { BusinessDataTransaction } from "../transactions";

@Container.injectable()
export class BusinessDataHandler extends Handlers.TransactionHandler{

    public async bootstrap(): Promise<void> {
        console.log("hello");
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public getConstructor(): Transactions.TransactionConstructor  {
        return BusinessDataTransaction;
    }

    public async isActivated(): Promise<boolean> {
        return true;
    }

    public walletAttributes(): ReadonlyArray<string> {
        return [];
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository): Promise<void> {
        return undefined;
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository): Promise<void> {
        return undefined;
    }
}
