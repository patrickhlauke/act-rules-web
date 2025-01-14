import React from 'react'
import Layout from '../components/layout'
import { graphql } from 'gatsby'
import SEO from '../components/seo'

export default ({ location, data }) => {
	const { markdownRemark } = data
	const { html, frontmatter } = markdownRemark

	return (
		<Layout location={location}>
			<SEO title={frontmatter.title} />
			<div>
				<h1>{frontmatter.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: html }} />
			</div>
		</Layout>
	)
}

export const query = graphql`
	query($slug: String!) {
		markdownRemark(fields: { slug: { eq: $slug } }) {
			html
			frontmatter {
				title
			}
		}
	}
`
