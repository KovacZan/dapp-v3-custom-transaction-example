import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";
import { BusinessDataTransaction } from "../src/transactions";
import { BusinessDataBuilder } from "../src/builders";

describe("Test builder",()=>{
    it("should verify correctly", () => {
        Managers.configManager.setFromPreset("testnet");
        Transactions.TransactionRegistry.registerTransactionType(BusinessDataTransaction);

        const actual = new BusinessDataBuilder()
            .businessDataAsset({
                name: "google",
                website: "https://google.com"
            })
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

        console.log(JSON.stringify(actual.build().toJson()));
        expect(actual.build().verified).toBeTrue();
        expect(actual.verify()).toBeTrue();
    });
});
