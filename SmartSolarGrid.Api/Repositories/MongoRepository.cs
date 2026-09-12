// ============================================================================
// File: MongoRepository.cs
// Description: Concrete generic repository executing direct MongoDB driver calls.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Linq.Expressions;
using MongoDB.Driver;

namespace SmartSolarGrid.Api.Repositories
{
    public class MongoRepository<T> : IMongoRepository<T> where T : class
    {
        private readonly IMongoCollection<T> _collection;

        // Initializes the collection reference from the injected database context.
        public MongoRepository(IMongoDatabase database, string collectionName)
        {
            _collection = database.GetCollection<T>(collectionName);
        }

        // Retrieves all documents from the specified MongoDB collection.
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        // Queries documents matching an expression tree predicate.
        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _collection.Find(predicate).ToListAsync();
        }

        // Queries a single document matching the provided criteria.
        public async Task<T?> GetOneAsync(Expression<Func<T, bool>> predicate)
        {
            return await _collection.Find(predicate).FirstOrDefaultAsync();
        }

        // Inserts a new document asynchronously into the collection.
        public async Task CreateAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        // Replaces an existing document matching the predicate.
        public async Task<bool> UpdateAsync(Expression<Func<T, bool>> predicate, T entity)
        {
            var result = await _collection.ReplaceOneAsync(predicate, entity);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        // Removes an existing document matching the predicate.
        public async Task<bool> DeleteAsync(Expression<Func<T, bool>> predicate)
        {
            var result = await _collection.DeleteOneAsync(predicate);
            return result.IsAcknowledged && result.DeletedCount > 0;
        }
    }
}
