const { hookable } = require('@evershop/evershop/src/lib/util/hookable');
const {
  startTransaction,
  commit,
  rollback,
  select,
  del
} = require('@evershop/postgres-query-builder');
const {
  getConnection
} = require('@evershop/evershop/src/lib/postgres/connection');

async function deleteAttributeData(uuid, connection) {
  await del('attribute').where('uuid', '=', uuid).execute(connection);
}
/**
 * Delete attribute service. This service will delete an attribute with all related data
 * @param {String} uuid
 * @param {Object} context
 */
async function deleteAttribute(uuid, context) {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    const attribute = await select()
      .from('attribute')
      .where('uuid', '=', uuid)
      .load(connection);

    if (!attribute) {
      throw new Error('Invalid attribute id');
    }
    await hookable(deleteAttributeData, { ...context, connection, attribute })(
      uuid,
      connection
    );
    await commit(connection);
    return attribute;
  } catch (e) {
    await rollback(connection);
    throw e;
  }
}

module.exports = async (uuid, context) => {
  // Make sure the context is either not provided or is an object
  if (context && typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  const attribute = await hookable(deleteAttribute, context)(uuid, context);
  return attribute;
};
