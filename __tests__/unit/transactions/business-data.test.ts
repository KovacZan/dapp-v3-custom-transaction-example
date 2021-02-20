import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";

import { BusinessDataBuilder } from "../../../src/builders";
import { BusinessDataTransaction } from "../../../src/transactions";

describe("Test builder", () => {
    it("should verify correctly", () => {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2);
        Transactions.TransactionRegistry.registerTransactionType(BusinessDataTransaction);

        const actual = new BusinessDataBuilder()
            .businessDataAsset({
                name: "google",
                website: "https://google.com",
            })
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire")
            .getStruct();

        const serialized = Transactions.TransactionFactory.fromData(actual).serialized.toString("hex");
        const deserialized = Transactions.Deserializer.deserialize(serialized);

        expect(deserialized.data.asset!.businessData).toStrictEqual({
            name: "google",
            website: "https://google.com",
        });
    });
});
