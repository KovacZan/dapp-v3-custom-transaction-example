import { Transactions, Utils } from "@arkecosystem/crypto";
import { Utils as AppUtils } from "@arkecosystem/core-kernel";
import { BusinessDataStaticFee, BusinessDataType, BusinessDataTypeGroup, TransactionVersion } from "../constants";
import { IBusinessData } from "../interfaces";
import ByteBuffer from "bytebuffer";

const { schemas } = Transactions;

export class BusinessDataTransaction extends Transactions.Transaction {
    public static typeGroup: number = BusinessDataTypeGroup;

    public static type: number = BusinessDataType;

    public static key: string = "businessData";

    public static version: number = TransactionVersion;

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
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    public serialize(): ByteBuffer {
        const { data } = this;

        AppUtils.assert.defined<IBusinessData>(data.asset?.businessData);

        const businessData: IBusinessData = data.asset.businessData;

        const businessName: Buffer = Buffer.from(businessData.name, "utf8");
        const businessWebsite: Buffer = Buffer.from(businessData.website, "utf8");

        const buffer: ByteBuffer = new ByteBuffer(businessName.length + businessWebsite.length + 2, true);

        buffer.writeByte(businessName.length);
        buffer.append(businessName, "hex");

        buffer.writeByte(businessWebsite.length);
        buffer.append(businessWebsite, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;

        const nameLength: number = buf.readUint8();
        const name: string = buf.readString(nameLength);

        const websiteLength: number = buf.readUint8();
        const website: string = buf.readString(websiteLength);

        const businessData: IBusinessData = {
            name,
            website,
        };

        data.asset = {
            businessData,
        };
    }
}
