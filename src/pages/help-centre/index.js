import React, { Component } from 'react'
import matchSorter from 'match-sorter'
import styled from 'styled-components'
import { navigate } from '@reach/router'
import { Breadcrumb } from 'gatsby-plugin-breadcrumb'
import { articles } from './_help-articles'
import { ArticleSection } from './_article-section'
import { SearchSuccess, SearchError } from './_search-results'
import { Contact } from './_contact-us'
// TODO: active this line after having mail service
import { DidntFindYourAnswerBanner } from './_didnt-find-answer'
import { SEO, Container } from 'components/containers'
import { Header } from 'components/elements'
import Layout from 'components/layout/layout'
import { localize, WithIntl } from 'components/localization'
import { getLocationHash, sanitize } from 'common/utility'
import device from 'themes/device'
// Icons
import SearchIcon from 'images/svg/search.svg'
import CrossIcon from 'images/svg/cross.svg'

const getAllArticles = articles =>
    articles
        .map(category => category.articles)
        // flatten the array, gatsby build does not support .flat() yet
        .reduce((arr, article_arr) => arr.concat(article_arr), [])

const Backdrop = styled.div`
    padding: 8rem;
    background-color: var(--color-white);
    border-bottom: 1px solid var(--color-grey-8);
`
const StyledContainer = styled(Container)`
    @media ${device.tabletL} {
        padding: 10rem 0 2rem 0;
    }
`
const SearchSection = styled.section`
    ${Backdrop} {
        max-height: ${props => (props.show ? '100rem' : '0')};
        transition: ${props => (props.has_transition ? 'max-height 0.6s ease-in-out' : 'none')};
        overflow: hidden;
    }
`

const SearchCrossIcon = styled(CrossIcon)`
    width: 2.3rem;
    height: 2.3rem;

    :hover {
        cursor: pointer;
    }

    @media ${device.tabletL} {
        position: absolute;
    }
`

const SearchForm = styled.form`
    position: relative;
    padding-left: 6.4rem;
    border: 1px solid var(--color-grey-8);
    border-radius: 6px;

    @media ${device.tabletL} {
        padding-left: 5.3rem;

        svg {
            top: 0;
            width: 2.5rem;
            height: 3.55rem;
        }
    }
`
const SearchIconBig = styled(SearchIcon)`
    width: 2.3rem;
    height: 2.3rem;
    position: absolute;
    left: 3rem;
    top: 2.4rem;
`
const Search = styled.input`
    width: 95%;
    font-size: var(--text-size-m);
    font-weight: 500;
    color: var(--color-black);
    background-color: var(--color-white);
    border: none;
    outline: none;
    height: 7.2rem;

    ::placeholder {
        color: var(--color-grey-8);
    }
    @media ${device.tabletL} {
        font-size: 3rem;
        height: 3.55rem;
    }
    @media ${device.mobileL} {
        font-size: 2.5rem;
    }
    @media ${device.mobileM} {
        font-size: 1.95rem;
    }
`

const ResultWrapper = styled.div`
    > :first-child {
        margin-top: 4rem;
        margin-bottom: 1.6rem;
    }
`
const StyledHeader = styled(Header)`
    margin-bottom: 4rem;
`
class HelpCentre extends Component {
    constructor(props) {
        super(props)
        this.state = {
            all_articles: [],
            search: '',
            selected_article: null,
            search_has_transition: false,
            toggle_search: true,
        }
    }

    handleInputChange = e => {
        e.preventDefault()
        const { name, value } = e.target
        this.setState({ [name]: `${sanitize(value)}` })
    }

    handleSubmit = e => e.preventDefault()

    handleSelectArticle = article => {
        navigate(`#${article.label}`)
        this.setState({
            selected_article: article,
            toggle_search: false,
            search_has_transition: false,
            search: '',
        })
    }

    toggleSearch = () =>
        this.setState(prevState => ({
            toggle_search: !prevState.toggle_search,
            search_has_transition: true,
        }))

    clearSearch = () => this.setState({ search: '' })

    componentDidMount = () => {
        const current_label = getLocationHash()
        const deepClone = arr => {
            const out = []
            for (let i = 0, len = arr.length; i < len; i++) {
                const item = arr[i]
                const obj = {}
                for (var k in item) {
                    obj[k] = item[k]
                }
                out.push(obj)
            }
            return out
        }

        if (current_label) {
            const selected_article = this.state.all_articles.find(
                article => article.label === current_label,
            )
            this.setState({
                selected_article,
                toggle_search: false,
                search_has_transition: false,
            })
        }
        const all_articles = getAllArticles(articles)

        const duplicate_articles = deepClone(all_articles)
        const translated_articles = duplicate_articles.map(article => {
            article.title = localize(article.title.props.translate_text)
            article.sub_category = localize(article.sub_category.props.translate_text)
            return article
        })

        this.setState({
            all_articles: translated_articles,
        })
    }

    componentDidUpdate = () => {
        const current_label = getLocationHash()

        if (!current_label && this.state.selected_article) {
            this.setState({
                selected_article: null,
                toggle_search: true,
                search_has_transition: false,
            })
        }
    }

    render() {
        const {
            all_articles,
            search,
            selected_article,
            toggle_search,
            search_has_transition,
        } = this.state

        const filtered_articles = matchSorter(all_articles, search.trim(), {
            keys: ['title', 'sub_category'],
        })
        const has_results = !!filtered_articles.length
        return (
            <Layout>
                <Breadcrumb
                    location={window.location}
                    crumbLabel="Help Centre"
                    crumbStyle={{ color: '#333333' }}
                    crumbActiveStyle={{ color: '#d6d6d6' }}
                    crumbSeparator=" > "
                />
                <SEO
                    title={localize('Help')}
                    description={localize(
                        'Need help with our products and services? Read our FAQ or ask us a question.',
                    )}
                />
                <SearchSection show={toggle_search} has_transition={search_has_transition}>
                    <Backdrop>
                        <StyledContainer align="normal" direction="column">
                            <StyledHeader as="h1">{localize('How can we help?')}</StyledHeader>
                            <SearchForm onSubmit={this.handleSubmit}>
                                <SearchIconBig />
                                <Search
                                    autoFocus
                                    name="search"
                                    value={search}
                                    onChange={this.handleInputChange}
                                    placeholder={localize('Try “Trade”')}
                                    data-lpignore="true"
                                    autoComplete="off"
                                />
                                {search.length && <SearchCrossIcon onClick={this.clearSearch} />}
                            </SearchForm>
                            <ResultWrapper>
                                {has_results && search.length && (
                                    <SearchSuccess
                                        suggested_topics={filtered_articles}
                                        onClick={this.handleSelectArticle}
                                        max_length={3}
                                    />
                                )}
                                {!has_results && search.length && <SearchError search={search} />}
                            </ResultWrapper>
                        </StyledContainer>
                    </Backdrop>
                </SearchSection>
                {/* <Link to="/help-centre/account-article">Account</Link> */}

                <ArticleSection
                    articles={articles}
                    all_articles={all_articles}
                    selected_article={selected_article}
                    handleSelectArticle={this.handleSelectArticle}
                    toggleSearch={this.toggleSearch}
                />
                <Contact></Contact>
                {/*TODO: active this line after having mail service*/}
                {<DidntFindYourAnswerBanner />}
            </Layout>
        )
    }
}

export default WithIntl()(HelpCentre)
