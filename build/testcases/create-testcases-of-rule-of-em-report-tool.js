const scUrlsMetaData = require('./../../_data/sc-urls.json')
const scEmReportAuditResult = require('./../../_data/sc-em-report-audit-result.json')
const graphContext = require('./wcag-em-report-tool-mappings/earl-context.json')
const graphAdditionalMeta = require('./wcag-em-report-tool-mappings/@graph-additional-meta.json')
const graphEvaluatorMeta = require('./wcag-em-report-tool-mappings/@graph-evaluator-meta.json')
const createFile = require('../../utils/create-file')

/**
 * Create testcases json file that can be used by
 */
const createTestcasesOfRuleOfEmReportTool = async (options, actRulesCommunityPkg) => {
	const { ruleId, ruleName, ruleTestcases, ruleAccessibilityRequirements } = options
	const {
		www: { url },
	} = actRulesCommunityPkg

	const title = `Report for ACT-R Rule - ${ruleName}`
	const siteName = `ACT-R Rule - ${ruleName}`
	const siteScope = `${url}/testcases/${ruleId}/`

	const webpages = ruleTestcases.map((testcase, index) => {
		const { url, testcaseId } = testcase
		return {
			type: ['TestSubject', 'WebPage'],
			id: `_:struct_${index}`,
			description: url,
			source: url,
			title: testcaseId,
			tested: false,
		}
	})

	const ruleScs = ruleAccessibilityRequirements
		? Object.keys(ruleAccessibilityRequirements).map(key => {
				return key.split(':').pop()
		  })
		: []

	const matchingScTests = ruleScs
		.filter(scNum => {
			if (scUrlsMetaData[scNum]) {
				return true
			}
			return false
		})
		.map(scNum => scUrlsMetaData[scNum].test.toLowerCase())

	const auditResults = scEmReportAuditResult.map(auditResult => {
		auditResult.result.outcome = matchingScTests.includes(auditResult.test.toLowerCase())
			? 'earl:cantTell'
			: 'earl:inapplicable'
		return auditResult
	})

	const json = {
		'@graph': [
			{
				'@context': graphContext,
				...graphAdditionalMeta,
				title,
				evaluationScope: {
					type: 'EvaluationScope',
					conformanceTarget: 'wai:WCAG2AA-Conformance',
					additionalEvalRequirement: '',
					website: {
						type: ['TestSubject', 'WebSite'],
						id: '_:website',
						siteName,
						siteScope,
					},
					accessibilitySupportBaseline: '<< Fill out >>',
				},
				auditResults,
				structuredSample: {
					webpage: webpages,
				},
			},
			{
				...graphEvaluatorMeta,
			},
		],
	}

	await createFile(
		`_data/rules-testcases/testcases/${ruleId}/rule-${ruleId}-testcases-for-em-report-tool.json`,
		JSON.stringify(json, undefined, 2)
	)
}

module.exports = createTestcasesOfRuleOfEmReportTool
