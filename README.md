# Welcome to PolkStakes!

PolkStakes - Polkadot Staking Dashboard

PolkStakes ranking is a new standard for rating Polkadot Validators. This ranking is based on various factors like era performance, commmissions, previous staking rewards, etc.

All the data is indexed using subquery and is fetched from the subquery project deployed at [here](https://explorer.subquery.network/subquery/ashikmeerankutty/polkstakes)

The ranking is based on last 5000 staking rewards

## Development

From your terminal:

```sh
npm install
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

## Screenshots

Loading Data

![image](./screenshots/1.png)

Ranked validators

![image](./screenshots/2.png)

Commissions History

![image](./screenshots/3.png)

Staking Rewards History

![image](./screenshots/4.png)

Sorting based on average staking rewards

![image](./screenshots/5.png)
