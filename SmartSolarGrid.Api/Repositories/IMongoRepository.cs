// ============================================================================
// File: IMongoRepository.cs
// Description: Generic abstraction for MongoDB data collection operations.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Linq.Expressions;

namespace SmartSolarGrid.Api.Repositories
{
    public interface IMongoRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T?> GetOneAsync(Expression<Func<T, bool>> predicate);
        Task CreateAsync(T entity);
        Task<bool> UpdateAsync(Expression<Func<T, bool>> predicate, T entity);
        Task<bool> DeleteAsync(Expression<Func<T, bool>> predicate);
    }
}
