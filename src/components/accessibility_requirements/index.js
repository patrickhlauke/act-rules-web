import techniquesTitles from '../../../_data/techniques-titles'
import scUrls from '../../../_data/sc-urls'
import React from 'react'

function OutcomeMapping({
	failed = 'not satisfied',
	passed = 'further testing is needed',
	inapplicable = 'further testing is needed',
}) {
	return (
		<li>
			Outcome mapping:
			<ul>
				<li>
					Any <code>failed</code> outcomes: {failed}.
				</li>
				<li>
					All <code>passed</code> outcomes: {passed}.
				</li>
				<li>
					An <code>inapplicable</code> outcome: {inapplicable}.
				</li>
			</ul>
		</li>
	)
}

function AccessibilityRequirementsListing({ item, listType, title, learnMore, conformanceTo, url, mapping }) {
	if (listType === 'text') {
		return (
			<li key={item}>
				<a className="sc-item" href={url} target="_blank" rel="noopener noreferrer">
					{title}
				</a>
			</li>
		)
	}

	return (
		<li>
			<details>
				<summary>{title}</summary>
				<ul>
					<li>
						<a className="sc-item" href={url} target="_blank" rel="noopener noreferrer">
							Learn More about {learnMore}
						</a>
					</li>
					<li>
						<>
							<strong>Required for conformance</strong> {conformanceTo}.
						</>
					</li>
					<OutcomeMapping failed={mapping.failed} passed={mapping.passed} inapplicable={mapping.inapplicable} />
				</ul>
			</details>
		</li>
	)
}

// For documents where we provide the title, and where the item is an URL anchor
function BasicListing({ conformanceDocument, item, mapping, listType }) {
	const { conformanceTo, baseURL } = {
		aria11: {
			conformanceTo: 'to WAI-ARIA 1.1 specifications',
			baseURL: 'https://www.w3.org/TR/wai-aria-1.1/#',
		},
		'using-aria': {
			conformanceTo: 'to "Using ARIA" specifications',
			baseURL: 'https://www.w3.org/TR/using-aria/#',
		},
	}[conformanceDocument]

	return (
		<AccessibilityRequirementsListing
			item={item}
			listType={listType}
			title={mapping.title}
			learnMore={mapping.title}
			conformanceTo={conformanceTo}
			url={`${baseURL}${item}`}
			mapping={mapping}
		/>
	)
}

// For WCAG techniques. Title is grabbed from data fetched during build. URL is handcrafted.
function TechniqueListing({ item, mapping, listType }) {
	const techniqueId = item.toUpperCase()
	const techniqueKind = {
		aria: 'aria',
		c: 'css',
		f: 'failures',
		flash: 'flash',
		g: 'general',
		h: 'html',
		pdf: 'pdf',
		scr: 'client-side-script',
		sl: 'silverlight',
		sm: 'smil',
		svr: 'server-side-script',
		t: 'text',
	}[item.replace(/[0-9]/g, '')]

	const url = `https://www.w3.org/WAI/WCAG21/Techniques/${techniqueKind}/${techniqueId}`
	const title = `${techniqueId}: ${techniquesTitles[techniqueId]}`

	return (
		<AccessibilityRequirementsListing
			item={item}
			listType={listType}
			title={title}
			learnMore={title}
			conformanceTo={`to WCAG technique ${techniqueId}`}
			url={url}
			mapping={mapping}
		/>
	)
}

// For WCAG SC. Title, URL and more is grabbed from data fetched during build.
function WcagListing({ item, mapping, listType }) {
	const { num, url, handle, wcagType, level } = scUrls[item]

	return (
		<AccessibilityRequirementsListing
			item={item}
			listType={listType}
			title={`${num} ${handle} (Level: ${level})`}
			learnMore={`${num} (${handle})`}
			conformanceTo={`to WCAG ${wcagType} and above on level ${level} and above`}
			url={url}
			mapping={mapping}
		/>
	)
}

export default function AccessibilityRequirements({ accessibility_requirements, type = 'details' }) {
	if (!accessibility_requirements) {
		return (
			<div className="meta">
				<span className="heading">Accessibility Requirements Mapping</span>
				<ul>
					<li>This rule is not required for conformance.</li>
				</ul>
			</div>
		)
	}

	const conformanceRequirements = Object.entries(accessibility_requirements).filter(
		([_, value]) => value && !!value.forConformance
	)

	return (
		<div className="meta">
			<span className="heading">Accessibility Requirements Mapping</span>
			<ul>
				{conformanceRequirements.map(([req, mapping]) => {
					const [conformanceDocument, conformanceItem] = req.toLocaleLowerCase().split(':')

					switch (conformanceDocument) {
						case 'aria11':
						case 'using-aria':
							return (
								<BasicListing
									key={conformanceItem}
									conformanceDocument={conformanceDocument}
									item={conformanceItem}
									mapping={mapping}
									listType={type}
								/>
							)
						case 'wcag20':
						case 'wcag21':
							return <WcagListing key={conformanceItem} item={conformanceItem} mapping={mapping} listType={type} />
						case 'wcag-technique':
							return <TechniqueListing key={conformanceItem} item={conformanceItem} mapping={mapping} listType={type} />
						default:
							return <>Accessibility Requirements have no or unknown mapping.</>
					}
				})}
			</ul>
		</div>
	)
}
