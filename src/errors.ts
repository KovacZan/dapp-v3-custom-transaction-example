import { Errors } from "@arkecosystem/core-transactions";

export class BusinessAlreadyHasData extends Errors.TransactionError {
    public constructor() {
        super(`Failed to apply transaction, because business already has businessData.`);
    }
}
