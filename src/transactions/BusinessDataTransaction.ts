import { Transactions, Utils } from "@arkecosystem/crypto";
import { BusinessDataStaticFee, BusinessDataType, BusinessDataTypeGroup } from "../constants";

const { schemas } = Transactions;

export class BusinessDataTransaction extends Transactions.Transaction{
    public static typeGroup: number = BusinessDataTypeGroup;
    public static type: number = BusinessDataType;
    public static key: string = "businessData";
    public static version: number = 2;

    protected static defaultStaticFee: Utils.BigNumber = BusinessDataStaticFee;

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "businessData",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: BusinessDataType },
                typeGroup: { const: BusinessDataTypeGroup },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["businessData"],
                    properties: {
                        businessData: {
                            type: "object",
                            required: ["name", "website"],
                            properties: {
                                name: {
                                    $ref: "genericName",
                                },
                                website: {
                                    $ref: "uri",
                                }
                            }
                        },
                    },
                },
            },
        });
    }

    public deserialize(buf: ByteBuffer): void {
    }

    public serialize(): ByteBuffer | undefined {
        return undefined;
    }

}
