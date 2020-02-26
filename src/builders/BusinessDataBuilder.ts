import { Transactions, Utils, Interfaces } from "@arkecosystem/crypto";
import { BusinessDataTransaction } from "../transactions";
import { BusinessDataType, BusinessDataTypeGroup } from "../constants";
import { IBusinessData } from "../interfaces";


export class BusinessDataBuilder extends Transactions.TransactionBuilder<BusinessDataBuilder> {
    public constructor() {
        super();
        this.data.version = 2;
        this.data.typeGroup = BusinessDataTypeGroup;
        this.data.type = BusinessDataType;
        this.data.fee = BusinessDataTransaction.staticFee();
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { businessData: {} };
    }

    public businessDataAsset(businessData: IBusinessData): BusinessDataBuilder{
        this.data.asset = {
            ...businessData
        };
        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): BusinessDataBuilder {
        return this;
    }

}
