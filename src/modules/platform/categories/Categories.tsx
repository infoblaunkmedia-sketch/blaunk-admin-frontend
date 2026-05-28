import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory, type CategoryNode,
} from '../categories.service';

const inputClass = 'h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary';

function flatten(nodes: CategoryNode[], depth = 0): Array<CategoryNode & { depth: number }> {
  const out: Array<CategoryNode & { depth: number }> = [];
  nodes.forEach((n) => {
    out.push({ ...n, depth });
    if (n.children?.length) out.push(...flatten(n.children, depth + 1));
  });
  return out;
}

export const Categories: React.FC = () => {
  const [tree, setTree] = React.useState<CategoryNode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [parentId, setParentId] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setTree(await fetchCategories());
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const flat = flatten(tree);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await createCategory({ name: name.trim(), parentId: parentId || null, isActive: true });
      setName('');
      setParentId('');
      toast.success('Category added');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const toggleActive = async (c: CategoryNode) => {
    try {
      await updateCategory(c.id, { isActive: !c.isActive });
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Categories" subtitle="Category tree for product taxonomy and public site dropdowns." />
      <SectionCard title="Add category">
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Name" required>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Parent (optional)">
            <select className={inputClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— Root —</option>
              {flat.map((c) => (
                <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
              ))}
            </select>
          </FormField>
          <div className="flex items-end">
            <button type="button" onClick={handleAdd} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white">
              Add
            </button>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Category tree" className="mt-4">
        {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
          <ul className="space-y-1 text-sm">
            {flat.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2">
                <span style={{ paddingLeft: c.depth * 16 }}>
                  <span className="font-semibold">{c.name}</span>
                  <span className="ml-2 text-slate-400">/{c.slug}</span>
                  {!c.isActive && <span className="ml-2 text-red-600">(inactive)</span>}
                </span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => toggleActive(c)} className="text-xs text-primary">Toggle active</button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </ErrorBoundary>
  );
};
