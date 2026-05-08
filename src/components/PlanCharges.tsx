import React from 'react';

const PLANS = [
  { name: 'Standard', duration: '2M Validity', subscription: 300, renewal: 300, luxury: 300 },
  { name: 'Silver', duration: '3M Validity', subscription: 300, renewal: 300, luxury: 300 },
  { name: 'Gold', duration: '6M Validity', subscription: 500, renewal: 500, luxury: 500 },
  { name: 'Platinum', duration: '1Yr Validity', subscription: 999, renewal: 999, luxury: 999 },
  { name: 'Premium', duration: '1Yr Validity', subscription: 1999, renewal: 1999, luxury: 1999 },
  { name: 'Diamond', duration: '2Yr Validity', subscription: 999, renewal: 999, luxury: 999 },
];

const PLAN_FOR_OPTIONS = [
  'Tour',
  'Cake',
  'Bgt',
  'Advertisement',
  'Boutique',
  'Garments',
  'Housing',
  'Computer',
  'Logistic',
  'Dial',
  'Slider',
  'Explore new',
  'Brand',
  'Gif',
  'Store',
  'Trendy star',
  'New launch',
  'Exclusive',
  'Business card',
  'Deal and offer',
  'Sponser-General',
  'Sponser-Global',
  'Packages',
] as const;

export const PlanCharges: React.FC = () => {
  const [planFor, setPlanFor] = React.useState<(typeof PLAN_FOR_OPTIONS)[number]>('Cake');
  const [selectedPlans, setSelectedPlans] = React.useState<Record<string, boolean>>({});
  const [savedCharges, setSavedCharges] = React.useState<Record<string, { subscription: number; renewal: number; luxury: number }>>(
    () =>
      Object.fromEntries(
        PLANS.map((p) => [p.name, { subscription: p.subscription, renewal: p.renewal, luxury: p.luxury }]),
      ),
  );
  const [draftCharges, setDraftCharges] = React.useState<Record<string, { subscription: string; renewal: string; luxury: string }>>(
    () =>
      Object.fromEntries(
        PLANS.map((p) => [p.name, { subscription: String(p.subscription), renewal: String(p.renewal), luxury: String(p.luxury) }]),
      ),
  );

  const togglePlan = (name: string, checked: boolean) => {
    setSelectedPlans((prev) => ({ ...prev, [name]: checked }));
    if (!checked) {
      const base = savedCharges[name];
      if (base) {
        setDraftCharges((prev) => ({
          ...prev,
          [name]: { subscription: String(base.subscription), renewal: String(base.renewal), luxury: String(base.luxury) },
        }));
      }
    }
  };

  const showActions = Object.values(selectedPlans).some(Boolean);

  const handleSave = (name: string) => {
    const draft = draftCharges[name];
    if (!draft) return;
    const subscription = Math.max(0, Number(draft.subscription || 0));
    const renewal = Math.max(0, Number(draft.renewal || 0));
    const luxury = Math.max(0, Number(draft.luxury || 0));

    setSavedCharges((prev) => ({
      ...prev,
      [name]: { subscription, renewal, luxury },
    }));

    // After saving, revert row to "before" state (unchecked / not editable)
    setSelectedPlans((prev) => ({ ...prev, [name]: false }));
    setDraftCharges((prev) => ({
      ...prev,
      [name]: { subscription: String(subscription), renewal: String(renewal), luxury: String(luxury) },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <label className="text-sm font-semibold text-slate-700">Plan for:</label>
        <select
          value={planFor}
          onChange={(event) => setPlanFor(event.target.value as (typeof PLAN_FOR_OPTIONS)[number])}
          className="w-full max-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          {PLAN_FOR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-700">
              <th className="w-10 border-b border-slate-200 px-3 py-2" />
              <th className="border-b border-slate-200 px-3 py-2 font-semibold">Plan</th>
              <th className="border-b border-slate-200 px-3 py-2 font-semibold">Duration</th>
              <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                Subscription (in Rs.)
              </th>
              <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                Renewal Fees (in Rs.)
              </th>
              <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                Luxury Fees (in Rs.)
              </th>
              {showActions ? (
                <th className="w-24 border-b border-slate-200 px-3 py-2 font-semibold">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {PLANS.map((plan, index) => {
              const striped = index % 2 === 1;
              const checked = !!selectedPlans[plan.name];
              const saved = savedCharges[plan.name] ?? plan;
              const draft = draftCharges[plan.name] ?? {
                subscription: String(saved.subscription),
                renewal: String(saved.renewal),
                luxury: String(saved.luxury),
              };
              return (
                <tr
                  key={plan.name}
                  className={checked ? 'bg-white' : striped ? 'bg-slate-50' : 'bg-white'}
                >
                  <td className="border-b border-slate-200 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => togglePlan(plan.name, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-primary focus:ring-primary/40"
                    />
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-800">
                    {plan.name}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {plan.duration}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {checked ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={draft.subscription}
                        onChange={(e) =>
                          setDraftCharges((prev) => ({
                            ...prev,
                            [plan.name]: { ...draft, subscription: e.target.value },
                          }))
                        }
                        className="h-9 w-full min-w-[7rem] rounded-md border border-primary bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-primary/25"
                      />
                    ) : (
                      saved.subscription
                    )}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {checked ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={draft.renewal}
                        onChange={(e) =>
                          setDraftCharges((prev) => ({
                            ...prev,
                            [plan.name]: { ...draft, renewal: e.target.value },
                          }))
                        }
                        className="h-9 w-full min-w-[7rem] rounded-md border border-primary bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-primary/25"
                      />
                    ) : (
                      saved.renewal
                    )}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {checked ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={draft.luxury}
                        onChange={(e) =>
                          setDraftCharges((prev) => ({
                            ...prev,
                            [plan.name]: { ...draft, luxury: e.target.value },
                          }))
                        }
                        className="h-9 w-full min-w-[7rem] rounded-md border border-primary bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-primary/25"
                      />
                    ) : (
                      saved.luxury
                    )}
                  </td>
                  {showActions ? (
                    <td className="border-b border-slate-200 px-3 py-2">
                      {checked ? (
                        <button
                          type="button"
                          onClick={() => handleSave(plan.name)}
                          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Save
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

