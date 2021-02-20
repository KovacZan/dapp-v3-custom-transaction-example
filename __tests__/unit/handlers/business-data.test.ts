import "jest-extended";

import { Application, Contracts } from "@arkecosystem/core-kernel";
import { Identifiers } from "@arkecosystem/core-kernel/src/ioc";
import { Wallets } from "@arkecosystem/core-state";
import { passphrases } from "@arkecosystem/core-test-framework";
import { Generators } from "@arkecosystem/core-test-framework/src";
import { Handlers } from "@arkecosystem/core-transactions";
import { Managers, Transactions } from "@arkecosystem/crypto";

// eslint-disable-next-line jest/no-mocks-import
import { setMockTransaction } from "../__mocks__/transaction-repository";
import { buildWallet, initApp, transactionHistoryService } from "../__support__/app";
import { BusinessDataBuilder } from "../../../src/builders";
import { BusinessDataType, BusinessDataTypeGroup } from "../../../src/constants";
import { BusinessAlreadyHasData } from "../../../src/errors";
import { BusinessDataHandler } from "../../../src/handlers";
import { IBusinessData } from "../../../src/interfaces";
import { BusinessDataTransaction } from "../../../src/transactions";

let app: Application;

let wallet: Contracts.State.Wallet;

let walletRepository: Contracts.State.WalletRepository;

let transactionHandlerRegistry: Handlers.Registry;

let handler: Handlers.TransactionHandler;

beforeEach(() => {
    const config = Generators.generateCryptoConfigRaw();
    // Managers.configManager.setConfig(config);
    Managers.configManager.setConfig(config);
    app = initApp();
    wallet = buildWallet(app, passphrases[0]);
    app.bind(Identifiers.TransactionHandler).to(BusinessDataHandler);

    walletRepository = app.get<Wallets.WalletRepository>(Identifiers.WalletRepository);

    transactionHandlerRegistry = app.get<Handlers.Registry>(Identifiers.TransactionHandlerRegistry);

    handler = transactionHandlerRegistry.getRegisteredHandlerByType(
        Transactions.InternalTransactionType.from(BusinessDataType, BusinessDataTypeGroup),
        2,
    );
    walletRepository.index(wallet);
});

afterEach(() => {
    Transactions.TransactionRegistry.deregisterTransactionType(BusinessDataTransaction);
});

describe("Business data tests", () => {
    describe("bootstrap tests", () => {
        it("should test bootstrap method", async () => {
            const actual = new BusinessDataBuilder()
                .businessDataAsset({
                    name: "google",
                    website: "https://google.com",
                })
                .nonce("1")
                .sign(passphrases[0])
                .build();

            transactionHistoryService.streamByCriteria.mockImplementationOnce(async function* () {
                yield actual.data;
            });

            await expect(handler.bootstrap()).toResolve();

            expect(wallet.getAttribute<IBusinessData>("businessData")).toStrictEqual({
                name: "google",
                website: "https://google.com",
            });
        });
    });

    describe("throwIfCannotBeApplied tests", () => {
        it("should rejects because wallet is already a business", async () => {
            wallet.setAttribute<IBusinessData>("businessData", {
                name: "google",
                website: "https://google.com",
            });

            const actual = new BusinessDataBuilder()
                .businessDataAsset({
                    name: "google",
                    website: "https://google.com",
                })
                .nonce("1")
                .sign(passphrases[0])
                .build();

            setMockTransaction(actual);

            await expect(handler.throwIfCannotBeApplied(actual, wallet)).rejects.toThrow(BusinessAlreadyHasData);
        });
    });

    describe("apply tests", () => {
        it("should apply correctly", async () => {
            const actual = new BusinessDataBuilder()
                .businessDataAsset({
                    name: "google",
                    website: "https://google.com",
                })
                .nonce("1")
                .sign(passphrases[0])
                .build();

            await expect(handler.apply(actual)).toResolve();

            expect(wallet.getAttribute<IBusinessData>("businessData")).toStrictEqual({
                name: "google",
                website: "https://google.com",
            });
        });
    });

    describe("revert tests", () => {
        it("should revert correctly", async () => {
            const actual = new BusinessDataBuilder()
                .businessDataAsset({
                    name: "google",
                    website: "https://google.com",
                })
                .nonce("1")
                .sign(passphrases[0])
                .build();

            await handler.apply(actual);

            await expect(handler.revert(actual)).toResolve();

            expect(wallet.hasAttribute("businessData")).toBeFalsy();
        });
    });
});
