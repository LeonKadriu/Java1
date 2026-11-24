import { useEffect, useState, type FormEvent } from 'react';
import {
  AttributeType,
  type CategoryDto,
  type RequestAttributes,
} from '@marketplace/shared';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiClientError, api } from '../api/client';

type FieldValue = string | boolean;

export function CreateRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [attributes, setAttributes] = useState<Record<string, FieldValue>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const preselectedSlug = searchParams.get('category');

  useEffect(() => {
    let active = true;
    api
      .categories()
      .then((items) => {
        if (!active) return;
        setCategories(items);
        const initial =
          (preselectedSlug
            ? items.find((item) => item.slug === preselectedSlug)
            : undefined) ??
          items.find((item) => item.attributeSchema.length > 0) ??
          items[0];
        if (initial) {
          setCategoryId(initial.id);
          const defaults: Record<string, FieldValue> = {};
          for (const definition of initial.attributeSchema) {
            defaults[definition.key] =
              definition.type === AttributeType.BOOLEAN ? false : '';
          }
          setAttributes(defaults);
        }
      })
      .catch(() => {
        if (active) setError('Unable to load categories.');
      });
    return () => {
      active = false;
    };
  }, [preselectedSlug]);

  const selected = categories.find((item) => item.id === categoryId);

  function selectCategory(category: CategoryDto) {
    setCategoryId(category.id);
    const next: Record<string, FieldValue> = {};
    for (const definition of category.attributeSchema) {
      next[definition.key] = definition.type === AttributeType.BOOLEAN ? false : '';
    }
    setAttributes(next);
  }

  function setAttribute(key: string, value: FieldValue) {
    setAttributes((current) => ({ ...current, [key]: value }));
  }

  function buildAttributes(): RequestAttributes {
    const result: RequestAttributes = {};
    for (const definition of selected?.attributeSchema ?? []) {
      const value = attributes[definition.key];
      if (value === undefined || value === '') {
        continue;
      }
      result[definition.key] =
        definition.type === AttributeType.NUMBER
          ? Number(value)
          : definition.type === AttributeType.BOOLEAN
            ? Boolean(value)
            : String(value);
    }
    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const created = await api.createRequest({
        categoryId,
        title,
        description,
        city: city || undefined,
        country: country || undefined,
        startsAt: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : undefined,
        endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : undefined,
        budgetAmount: budget ? Number(budget) : undefined,
        currency,
        attributes: buildAttributes(),
      });
      navigate(`/requests/${created.id}`);
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : 'Unable to create request',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>New request</h1>
          <p className="muted">Fields change automatically with the category.</p>
        </div>
      </div>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label>
          Category *
          <select
            value={categoryId}
            onChange={(event) => {
              const category = categories.find(
                (item) => item.id === event.target.value,
              );
              if (category) selectCategory(category);
            }}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Title *
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={5}
            maxLength={150}
            required
            placeholder="Need someone to repair my refrigerator"
          />
        </label>

        <label>
          Description *
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            minLength={10}
            maxLength={5000}
            required
          />
        </label>

        {selected && selected.attributeSchema.length > 0 && (
          <fieldset className="dynamic-fields">
            <legend>{selected.name} details</legend>
            {selected.attributeSchema.map((definition) => {
              const value = attributes[definition.key];
              return (
                <label
                  key={definition.key}
                  className={
                    definition.type === AttributeType.BOOLEAN
                      ? 'checkbox'
                      : undefined
                  }
                >
                  {definition.label}
                  {definition.required ? ' *' : ''}
                  {definition.type === AttributeType.BOOLEAN ? (
                    <input
                      type="checkbox"
                      checked={value === true}
                      onChange={(event) =>
                        setAttribute(definition.key, event.target.checked)
                      }
                    />
                  ) : definition.type === AttributeType.SELECT ? (
                    <select
                      value={typeof value === 'string' ? value : ''}
                      required={definition.required}
                      onChange={(event) =>
                        setAttribute(definition.key, event.target.value)
                      }
                    >
                      <option value="">Choose…</option>
                      {definition.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        definition.type === AttributeType.NUMBER
                          ? 'number'
                          : definition.type === AttributeType.DATE
                            ? 'date'
                            : 'text'
                      }
                      value={typeof value === 'string' ? value : ''}
                      required={definition.required}
                      onChange={(event) =>
                        setAttribute(definition.key, event.target.value)
                      }
                    />
                  )}
                  {definition.unit && (
                    <span className="muted">{definition.unit}</span>
                  )}
                </label>
              );
            })}
          </fieldset>
        )}

        <div className="field-row">
          <label>
            City
            <input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label>
            Country
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            />
          </label>
        </div>

        <div className="field-row">
          <label>
            Start date
            <input
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </label>
        </div>

        <div className="field-row">
          <label>
            Budget
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </label>
          <label>
            Currency
            <input
              value={currency}
              maxLength={3}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting || !categoryId}>
          {submitting ? 'Publishing…' : 'Publish request'}
        </button>
      </form>
    </main>
  );
}
