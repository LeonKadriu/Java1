import { useEffect, useState } from 'react';
import { AttributeType, type CategoryDto } from '@marketplace/shared';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

function CategoryNode({
  category,
  depth,
}: {
  category: CategoryDto;
  depth: number;
}) {
  return (
    <li>
      <div className="category-row" style={{ paddingLeft: depth * 20 }}>
        <div>
          <Link to={`/requests/new?category=${category.slug}`}>
            {category.name}
          </Link>
          <span className="muted"> /{category.slug}</span>
        </div>
        <div className="category-actions">
          <span className="muted">
            {category.attributeSchema.length === 0
              ? 'Group'
              : `${category.attributeSchema.length} fields`}
          </span>
          <Link to={`/requests?categoryId=${category.id}`}>Browse requests</Link>
        </div>
      </div>
      {category.children && category.children.length > 0 && (
        <ul>
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoriesPage() {
  const [tree, setTree] = useState<CategoryDto[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .categoryTree()
      .then((result) => {
        if (!active) return;
        setTree(result);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load categories.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="muted">
            Categories are data: each one defines the fields a request must provide.
          </p>
        </div>
        <Link className="button-link" to="/requests/new">
          New request
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="message">Loading categories…</p>
      ) : (
        <section className="card">
          <ul className="category-tree">
            {tree.map((category) => (
              <CategoryNode key={category.id} category={category} depth={0} />
            ))}
          </ul>
        </section>
      )}

      <p className="muted hint">
        Field types in use: {Object.values(AttributeType).join(', ')}. New categories can be
        added without changing the backend code.
      </p>
    </main>
  );
}
