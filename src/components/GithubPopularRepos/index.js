import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import LanguageFilterItem from '../LanguageFilterItem'
import RepositoryItem from '../RepositoryItem'
import './index.css'

const languageFiltersData = [
  {id: 'ALL', language: 'All'},
  {id: 'JAVASCRIPT', language: 'Javascript'},
  {id: 'RUBY', language: 'Ruby'},
  {id: 'JAVA', language: 'Java'},
  {id: 'CSS', language: 'CSS'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class GithubPopularRepos extends Component {
  state = {
    reposList: [],
    active: null,
    activeOptionId: languageFiltersData[0].id,
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getRepositoryItems()
  }

  getRepositoryItems = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const {activeOptionId} = this.state
    const apiUrl = `https://apis.ccbp.in/popular-repos?language=${activeOptionId}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = fetchedData.popular_repos.map(eachRepo => ({
        name: eachRepo.name,
        id: eachRepo.id,
        issuesCount: eachRepo.issues_count,
        forksCount: eachRepo.forks_count,
        starsCount: eachRepo.stars_count,
        avatarUrl: eachRepo.avatar_url,
      }))
      this.setState({
        reposList: updatedData,
        apiStatus: apiStatusConstants.success,
      })
    } else if (response.status === 401) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    } else {
      throw new Error('Failed to fetch data')
    }
  }

  updateActiveOptionId = activeOptionId => {
    this.setState({activeOptionId}, this.getRepositoryItems)
  }

  changeStyle = id => {
    this.setState({active: id}, () => {
      if (id !== 'ALL') {
        this.updateActiveOptionId(id)
      } else {
        this.getRepositoryItems()
      }
    })
  }

  renderRepositoryItems = () => {
    const {reposList} = this.state
    return (
      <ul className="repos-list-cont">
        {reposList.map(eachRepo => (
          <RepositoryItem repoData={eachRepo} key={eachRepo.id} />
        ))}
      </ul>
    )
  }

  renderFailureView = () => (
    <div className="fail-cont">
      <img
        src="https://assets.ccbp.in/frontend/react-js/api-failure-view.png"
        className="failure-view-img"
        alt="failure view"
      />
      <h1>Something went wrong</h1>
    </div>
  )

  renderLoader = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" color="#0284c7" height={80} width={80} />
    </div>
  )

  render() {
    const {active, apiStatus} = this.state

    return (
      <div className="app-container">
        <div className="bg-container">
          <h1 className="title">Popular</h1>
          <ul className="languages-list-cont">
            {languageFiltersData.map(eachItem => (
              <button
                type="button"
                aria-label="Save"
                id={`language-filter-${eachItem.id}`}
                className={
                  eachItem.id === (active || 'ALL')
                    ? 'cust-button'
                    : 'normal-but'
                }
                onClick={() => this.changeStyle(eachItem.id)}
                key={eachItem.id}
              >
                <LanguageFilterItem languageDetails={eachItem} />
              </button>
            ))}
          </ul>
          {apiStatus === apiStatusConstants.inProgress && this.renderLoader()}
          {apiStatus === apiStatusConstants.success &&
            this.renderRepositoryItems()}
          {apiStatus === apiStatusConstants.failure && this.renderFailureView()}
        </div>
      </div>
    )
  }
}

export default GithubPopularRepos
