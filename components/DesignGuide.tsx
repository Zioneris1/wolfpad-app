import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
	<section className="fade-in" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
		<h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
		<div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{children}</div>
	</section>
);

const DesignGuide: React.FC = () => {
	return (
		<div className="py-2 md:py-6">
			<h2 className="text-3xl font-bold tracking-tight mb-6" style={{ textShadow: `0 0 5px var(--color-secondary-blue)` }}>
				Design Guide
			</h2>

			<div className="space-y-4 max-w-4xl">
				<Section title="Overall Design Philosophy">
					<p>
						A dark, modern "wolf den" theme. The palette uses deep, focused backgrounds (--color-bg-main), distinct paneling (--color-bg-panel), and sharp, glowing accents (--color-secondary-blue-glow, --color-primary-red-glow) to highlight critical information and actions. Professional, powerful, and free of clutter.
					</p>
					<p>
						A clear visual hierarchy prioritizes the most important, actionable information upfront, with secondary details available on demand.
					</p>
					<p>
						Responsiveness:
						<ul className="list-disc pl-5 mt-1">
							<li>Desktop/Tablet: multi-column with persistent Desktop Sidebar.</li>
							<li>Mobile: single-column with Bottom Navigation and compact Header.</li>
						</ul>
					</p>
				</Section>

				<Section title="1. Dashboard (The Command Center)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Two-column on desktop.</li>
						<li>Left: tabbed tasks (Due Today, Upcoming, No Due Date).</li>
						<li>Right: Controls (Pending/Completed/All, Sort by Impact/Created) + Stat Cards (Due Today, Overdue, Completed Today).</li>
						<li>Goal: immediate clarity on daily priorities.</li>
					</ul>
				</Section>

				<Section title="2. Goals View (Strategic Objectives)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Card grid; each card shows name, description, progress %, completed/total.</li>
						<li>Actions: Edit, Delete, AI Breakdown; expandable task list.</li>
						<li>Goal: visualize alignment from goals to daily tasks.</li>
					</ul>
				</Section>

				<Section title="3. Weekly View (The Weekly HUD)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Horizontal Kanban: To Schedule + seven day columns.</li>
						<li>Draggable task cards; easy reassignments.</li>
						<li>Goal: intuitive weekly planning and load balancing.</li>
					</ul>
				</Section>

				<Section title="4. Personal Schedule (Weekly Routine)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Top form to add recurring Routine Blocks.</li>
						<li>Below: 7-day grid; tabbed view on mobile.</li>
						<li>Mark done-for-today with a checkbox.</li>
					</ul>
				</Section>

				<Section title="5. Financials">
					<ul className="list-disc pl-5 space-y-1">
						<li>Top stat cards: Income, Expenses, Net Balance.</li>
						<li>Two-column: Left quick-add + Pie chart; Right history list.</li>
						<li>Goal: effortless tracking and instant health snapshot.</li>
					</ul>
				</Section>

				<Section title="6. Personal Development (The AI Planner)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Two columns: Left planner input; Right active plans.</li>
						<li>Each plan: goal + resources (books, channels, podcasts).</li>
						<li>Goal: automate research with actionable lists.</li>
					</ul>
				</Section>

				<Section title="7. The Den (The Journal)">
					<ul className="list-disc pl-5 space-y-1">
						<li>Top: large text area for Today’s Entry.</li>
						<li>Below: Journal Archive grouped by date.</li>
						<li>Goal: quiet, distraction-free journaling.</li>
					</ul>
				</Section>

				<Section title="8. Analytics & Reports">
					<ul className="list-disc pl-5 space-y-1">
						<li>Stat card grid (Pending, Completion Rate, Impact/Effort Ratio).</li>
						<li>Visuals: Donut chart; downloadable financial CSV.</li>
						<li>Goal: turn data into actionable insights.</li>
					</ul>
				</Section>

				<Section title="9. AI Agents">
					<ul className="list-disc pl-5 space-y-1">
						<li>Grid of agents: Prioritizer, Creator, Strategist.</li>
						<li>Goal: direct access to high-leverage AI tools.</li>
					</ul>
				</Section>

				<Section title="10. Settings">
					<ul className="list-disc pl-5 space-y-1">
						<li>Simple, centered configuration and data management.</li>
						<li>Goal: straightforward and unintrusive settings.</li>
					</ul>
				</Section>
			</div>
		</div>
	);
};

export default DesignGuide;