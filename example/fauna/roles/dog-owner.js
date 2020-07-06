/* eslint-disable @typescript-eslint/no-var-requires */
const { query } = require('faunadb');
const { Collection } = query;

module.exports = {
  name: 'dog_owner',
  membership: [{ resource: Collection('Person') }],
  privileges: [
    {
      resource: Collection('Person'),
      actions: {
        read: true,
      },
    },
    {
      resource: Collection('Dog'),
      actions: {
        read: true,
      },
    },
  ],
};
