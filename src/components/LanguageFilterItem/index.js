// Write your code here
import {Component} from 'react'
import './index.css'

class LanguageFilterItem extends Component {
  render() {
    const {languageDetails} = this.props
    const {language} = languageDetails

    return <li className="language-item">{language}</li>
  }
}

export default LanguageFilterItem
