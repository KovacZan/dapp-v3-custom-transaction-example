import "jest-extended";

import { Application, Contracts } from "@arkecosystem/core-kernel";
import { Identifiers } from "@arkecosystem/core-kernel/src/ioc";
import { Wallets } from "@arkecosystem/core-state";
import { Generators } from "@arkecosystem/core-test-framework/src";
import passphrases from "@arkecosystem/core-test-framework/src/internal/passphrases.json";
import { TransactionHandler } from "@arkecosystem/core-transactions/src/handlers";
import { TransactionHandlerRegistry } from "@arkecosystem/core-transactions/src/handlers/handler-registry";
import { Managers, Transactions } from "@arkecosystem/crypto";
import { configManager } from "@arkecosystem/crypto/src/managers";

import { setMockTransaction } from "../__mocks__/transaction-repository";
import { buildWallet, initApp } from "../__support__/app";
import { BusinessDataBuilder } from "../../../src/builders";
import { BusinessDataType, BusinessDataTypeGroup } from "../../../src/constants";
import { BusinessAlreadyHasData } from "../../../src/errors";
import { BusinessDataHandler } from "../../../src/handlers";
import { IBusinessData } from "../../../src/interfaces";
import { BusinessDataTransaction } from "../../../src/transactions";

let app: Application;

let wallet: Contracts.State.Wallet;

let walletRepository: Contracts.State.WalletRepository;

let transactionHandlerRegistry: TransactionHandlerRegistry;

let handler: TransactionHandler;

beforeEach(() => {
    const config = Generators.generateCryptoConfigRaw();
    configManager.setConfig(config);
    Managers.configManager.setConfig(config);
    app = initApp();
    wallet = buildWallet(app, passphrases[0]);
    app.bind(Identifiers.TransactionHandler).to(BusinessDataHandler);

    walletRepository = app.get<Wallets.WalletRepository>(Identifiers.WalletRepository);

    transactionHandlerRegistry = app.get<TransactionHandlerRegistry>(Identifiers.TransactionHandlerRegistry);

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

            setMockTransaction(actual);

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

            await expect(handler.throwIfCannotBeApplied(actual, wallet, walletRepository)).rejects.toThrow(
                BusinessAlreadyHasData,
            );
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

            await expect(handler.apply(actual, walletRepository)).toResolve();

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

            await handler.apply(actual, walletRepository);

            await expect(handler.revert(actual, walletRepository)).toResolve();

            expect(wallet.hasAttribute("businessData")).toBeFalsy();
        });
    });
});
