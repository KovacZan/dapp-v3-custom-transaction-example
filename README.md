![alt text](https://camo.githubusercontent.com/14087dd34462817d27e21e19e43f8288c0a4af1b/68747470733a2f2f692e696d6775722e636f6d2f683766704167762e706e67)
# ARK Core - dApp Installation Setup Steps

This is a basic example of Ark dApp development, by using our CustomTransaction approach with GTI and modular approach.

> This Example is currently operational only on our `core/3.0` branch!

This dApp enables a new transaction type on the ARK Core blockchain. New transaction types follows existing blockchain protocol.

### Specification:

Purpose: Enable of adding business data on the Core blockchain (with custom fields like name and website).

TransactionType: `BusinessData` Fields:

- name: string
- website: string | uri


Registered Transaction is fully compatible with existing [API (api/transactions/)](https://api.ark.dev/public-rest-api/endpoints/transactions)


## dApp Installation

### STEP 1: Install core v3
> If you already set up core environment you can skip Step 1 & 2
```bash
git clone https://github.com/arkecosystem/core
cd core
git checkout 3.0
```

### STEP 2: Setup Development Docker Database
Setup docker database config and run Postgres DB via Docker.
You can setup docker by following steps below:
```
yarn docker ark
cd docker/development/testnet
docker-compose up postgres
```
or follow the steps in the following link: https://learn.ark.dev/core-getting-started/spinning-up-your-first-testnet#step-1-start-docker-testnet-database

### STEP 3: Checkout This dApp Project As a GitSubmodule
```bash
cd plugins/ #location for loading of custom non-core dApps
git submodule add -f https://github.com/KovacZan/custom-transaction-core-v3
```


### STEP 4:  Load The dApp(Custom Transactions module) In The Corresponding Network Configurations

Go to:
`core/packages/core/bin/testnet`


```bash
cd packages/core/bin/config/testnet
```


Locate file `app.json`. We will add our plugin name to end of the list of the loaded plugins.
This means that core will pickup the plugin/dapp and load it for a specific network configuration.
Add:
```json
{
  "package": "@arkecosystem/core-transaction-pool"
},
```
to the `app.json` so it will look like this:
```json
{
    "core": {
        "plugins": [
              ...
            {
                "package": "@arkecosystem/core-transactions"
            },
            {
                "package": "@arkecosystem/core-magistrate-transactions"
            },
            {
                "package": "custom-transaction-corev3"
            },
            {
                "package": "@arkecosystem/core-transaction-pool"
            },
             ...
        ]
    },
```

### STEP 5: Compile code and Start Local Testnet Blockchaib
Before we start our Local Testnet we must compile code, this is done with:
`yarn setup` in `core` directory.

For starting local blockchain go to:
```bash
cd packages/core/testnet
yarn full:testnet
```
you can find more information in the following link:  https://learn.ark.dev/core-getting-started/spinning-up-your-first-testnet#step-2-testnet-network-boot

### STEP 6: Send New Custom Transaction To The Local Node

Send your new transaction type payload to the local blockchain node with the following `curl` command:

```bash
curl --request POST \
  --url http://localhost:4003/api/transactions \
  --header 'content-type: application/json' \
  --data '{
                "transactions":
                [
    			{
				"version":2,
				"network":23,
				"typeGroup":1001,
				"type": 0,
				"nonce":"3",
				"senderPublicKey":
				"03287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
				"fee":"10000000",
				"amount":"0",
				"asset":{
					"businessData":
					{"name":"google","website":"https://google.com"}
				},
				"signature":
				"5b8e412da6103bf6e8ee04771803495f4e1e65e38ef13e5618053fddca75c0a90c1ed515124c20f7bcba64fc38496754930f80e3bb85c9b206016960375e97c7",
				"id":
				"6dd8a22571acab801214f87dda9734f7050705d64d9c4ef9b24bb4d2ce489691"
			}

                ]
        }'

```

You should receive a response similar to this:

```curl
{
	"data":{
		"accept":["6dd8a22571acab801214f87dda9734f7050705d64d9c4ef9b24bb4d2ce489691"],
		"broadcast":["6dd8a22571acab801214f87dda9734f7050705d64d9c4ef9b24bb4d2ce489691"],
		"excess":[],
		"invalid":[]
	}
}
```
