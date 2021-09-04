/// <reference types="electron" />
declare const electron: typeof Electron
import * as React from 'react'
import * as types from '../types'
import * as ReactDOM from 'react-dom'
import { JSONEditor } from 'react-schema-based-json-editor'
import { locale as zhCNLocale } from 'schema-based-json-editor/dist/locales/zh-CN'
import hljs from 'highlight.js'

document.onclick = e => {
  const href = (e.target as HTMLAnchorElement).href
  if (href && href.indexOf('http') === 0) {
    e.preventDefault()
    electron.shell.openExternal(href)
  }
}

interface State {
  news?: types.NewsCategory[];
  configurationDialogIsVisiable?: boolean;
}

const buttonCommonClass = 'btn btn-link'

class MainComponent extends React.Component<unknown, State> {
  private schema: any
  private value!: types.ConfigData
  private locale = zhCNLocale
  private isValid = true
  private news: types.NewsCategory[] = []
  private configurationDialogIsVisiable = false

  componentDidMount() {
    electron.ipcRenderer.on('items', (event: Electron.Event, arg: types.NewsCategory) => {
      const index = this.news.findIndex(n => n.source === arg.source)
      if (arg.name) {
        arg.key = arg.name.replace(' ', '')
      }
      if (index === -1) {
        this.news.push(arg)
      } else {
        this.news[index] = arg
      }
      this.setState({ news: this.news })
    })
    electron.ipcRenderer.on('initialize', (event: Electron.Event, arg: types.InitialData) => {
      this.schema = arg.schema
      this.value = arg.startval
      document.title = `news fetcher client v${arg.version}`
    })
    electron.ipcRenderer.on('error', (event: Electron.Event, arg: types.ErrorMessage) => {
      alert(arg.message)
    })
    electron.ipcRenderer.send('items')
  }
  render() {
    const newsView = this.news.map(n => {
      if (n.items) {
        const itemsView = n.items.map((i, index) => {
          let detailView: JSX.Element | undefined
          if (i.detail) {
            detailView = (
              <a href={i.detail} className={buttonCommonClass + (i.hidden ? ' item-hidden' : '')}>detail</a>
            )
          }
          if (i.hidden) {
            return (
              <div key={index}>
                <a href={i.href} className='btn btn-link item-hidden'>{i.title}</a>
                {detailView}
              </div>
            )
          } else {
            return (
              <div key={index}>
                <a href={i.href} className={buttonCommonClass}>{i.title}</a>
                {detailView}
                <button className={buttonCommonClass} onClick={this.hide.bind(this, i)}>hide</button>
                <button className={buttonCommonClass} onClick={this.openAndHide.bind(this, i)}>open and hide</button>
              </div>
            )
          }
        })
        return (
          <div key={n.source} className='panel panel-default'>
            <div className='panel-heading'>
              <h3 className='panel-title' id={n.key}>
                <a href={n.source} className={buttonCommonClass}>{n.name}</a>
                <button className={buttonCommonClass} onClick={this.reload.bind(this, n)}>reload</button>
              </h3>
            </div>
            <div className='panel-body'>
              {itemsView}
            </div>
          </div>
        )
      } else {
        return (
          <div key={n.source} className='panel panel-default'>
            <div className='panel-heading'>
              <h3 className='panel-title' id={n.key}>
                <a href={n.source} className={buttonCommonClass}>{n.name}</a>
                <span className='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>
                <span>{n.error}</span>
                <button className={buttonCommonClass} onClick={this.reload.bind(this, n)}>reload</button>
              </h3>
            </div>
          </div>
        )
      }
    })

    const menuView = this.news.map(n => {
      let errorView: JSX.Element | undefined
      if (!n.items) {
        errorView = (
          <span className='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>
        )
      }
      return (
        <li key={n.source}>
          <a href={'#' + n.key} className={buttonCommonClass}>
            {n.name}
            {errorView}
          </a>
        </li>
      )
    })

    let configurationView: JSX.Element | null = null
    if (this.schema && this.configurationDialogIsVisiable) {
      configurationView = (
        <div id='configuration' className='configuration bootstrap3-row-container'>
          <JSONEditor schema={this.schema}
            initialValue={this.value}
            updateValue={this.updateValue}
            theme='bootstrap4'
            locale={this.locale}
            hljs={hljs} />
        </div>
      )
    }

    return (
      <div className='container'>
        <button className='btn btn-xs menu-configuration' onClick={this.toggleConfigurationDialog.bind(this)}>配置</button>
        <button className={this.configurationDialogIsVisiable && this.isValid ? 'btn btn-xs btn-primary menu-save' : 'btn btn-xs menu-save btn-primary hidden'} onClick={this.saveConfiguration.bind(this)}>保存</button>
        {configurationView}
        <ul className='menu list-unstyled'>{menuView}</ul>
        <div>{newsView}</div>
      </div>
    )
  }

  private updateValue = (value: any, isValid: boolean) => {
    this.value = value
    this.isValid = isValid
  }
  private reload(n: types.NewsCategory) {
    n.error = undefined
    this.setState({ news: this.news })
    electron.ipcRenderer.send('reload', n.source)
  }
  private hide(item: types.NewsItem) {
    item.hidden = true
    this.setState({ news: this.news })
    electron.ipcRenderer.send('hide', item.href)
  }
  private openAndHide(item: types.NewsItem) {
    electron.shell.openExternal(item.href)
    this.hide(item)
  }
  private toggleConfigurationDialog() {
    this.configurationDialogIsVisiable = !this.configurationDialogIsVisiable
    this.setState({
      configurationDialogIsVisiable: this.configurationDialogIsVisiable
    })
  }
  private saveConfiguration() {
    electron.ipcRenderer.send('saveConfiguration', this.value)
    this.configurationDialogIsVisiable = false
    this.setState({
      configurationDialogIsVisiable: this.configurationDialogIsVisiable
    })
  }
}

ReactDOM.render(<MainComponent />, document.getElementById('container'))
