// eslint-disable-next-line @typescript-eslint/no-var-requires
const { query } = require('faunadb');

const { Query, Lambda, Create, Collection, Let, Var, Select, Update } = query;

module.exports = {
  name: 'adopt',
  body: Query(
    Lambda(
      ['personName', 'dogName'],
      Let(
        {
          person: Create(Collection('Person'), {
            data: { name: Var('personName') },
          }),
          dog: Create(Collection('Dog'), {
            data: {
              name: Var('dogName'),
              owner: Select(['ref'], Var('person')),
            },
          }),
          updatePerson: Update(Select(['ref'], Var('person')), {
            data: { dog: Select(['ref'], Var('dog')) },
          }),
        },
        {
          person: Var('updatePerson'),
          dog: Var('dog'),
        }
      )
    )
  ),
};
