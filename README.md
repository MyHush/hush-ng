#  Hush Next-Generation

The Next Generation Hush GUI will include an integrated experience for users to
do tasks related to their wallets and having conversations with Hush Contacts,
i.e. sending + receiving HushList memos.

This wallet supports Shielded Addresses and Shielded Transactions.

Currently we are focused on HushList-related operations, since other basic wallets
exist. This codebase uses the Electron framework to enable cross-platform support
and supports Linux, Mac and Windows.

## Preview

<img src="https://raw.githubusercontent.com/MyHush/hush-ng/dev/static/hush-ng-addresses-preview.png" alt="Hush-NG preview">

## Installing + Running Hush-NG

You must have a recent version of NodeJS and npm installed: https://nodejs.org/en/download/

    # clone repo
    git clone https://github.com/MyHush/hush-ng
    cd hush-ng

    # install dependencies
    npm install

    # serve with hot reload at localhost:9080
    npm run dev

## Building Electron Binaries

    # build electron application for production
    npm run build

## Contributing

You are very welcome to submit patches to Hush-NG! Please send them to the `dev` branch,
which is our tip of development.

## License

GPLv3

