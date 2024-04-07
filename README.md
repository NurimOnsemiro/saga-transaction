# Saga Pattern Implementation

This repository contains an implementation of the Saga pattern, a design pattern used to handle long-running transactions and ensure data consistency in distributed systems.

## Overview

The `Saga` class is the main component of this implementation. It allows you to define a sequence of transactions, each with an execute and a compensate function. When you call the `execute` method, the `Saga` class will execute the transactions in the defined order, and if any transaction fails, it will automatically execute the compensate functions in reverse order to undo the changes made by the successful transactions.

The `TAsyncResult` type is a Promise-based result type that represents the outcome of the `execute` method. It can either be an `ok` result with a `void` value if all transactions are executed successfully, or an `err` result with an `Error` if any transaction fails.

## Usage

Here's an example of how to use the `Saga` class:

```typescript
import { Saga, ITransaction } from './saga';

// Define your transactions
const depositTransaction: ITransaction<number> = {
  name: 'Deposit',
  execute: (amount: number) => {
    // Execute the deposit operation
    return Promise.resolve(amount);
  },
  compensate: (amount: number) => {
    // Compensate the deposit operation
    return Promise.resolve(amount);
  },
};

const withdrawTransaction: ITransaction<number> = {
  name: 'Withdraw',
  execute: (amount: number) => {
    // Execute the withdraw operation
    return Promise.resolve(amount);
  },
  compensate: (amount: number) => {
    // Compensate the withdraw operation
    return Promise.resolve(amount);
  },
};

// Create a new Saga and add the transactions
const saga = Saga.new<number>()
  .addTransaction(depositTransaction)
  .addTransaction(withdrawTransaction);

// Execute the Saga
saga.execute(100).then((result) => {
  if (result.isOk()) {
    console.log('Saga executed successfully');
  } else {
    console.error('Saga failed:', result.error);
  }
});
```

## API

### `Saga` class

- `static new<T>(): Saga<T>`: Creates a new `Saga` instance for the given generic type `T`.
- `addTransaction(transaction: ITransaction<T>): Saga<T>`: Adds a transaction to the saga. Returns the `Saga` instance to allow method chaining.
- `execute(args: T): TAsyncResult<void, Error>`: Executes the transactions in the saga. Returns a `TAsyncResult` that resolves to an `ok` result with `void` value if all transactions are executed successfully, or an `err` result with an `Error` if any transaction fails.

### `ITransaction` interface

- `name: string`: The name of the transaction.
- `execute: (args: T) => Promise<T>`: The function that executes the transaction logic.
- `compensate: (args: T) => Promise<T>`: The function that compensates the transaction logic.

### `TAsyncResult` type

- `Promise<Result<T, E>>`: A Promise-based result type that represents the outcome of an asynchronous operation. It can either be an `ok` result with a value of type `T`, or an `err` result with an error of type `E`.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.