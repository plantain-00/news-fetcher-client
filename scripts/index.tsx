import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";
import { JSONEditor } from "schema-based-json-editor/dist/react";
import * as hljs from "highlight.js";

(window as any)["jQuery"] = $;
require("bootstrap");

const body = $("html,body");

/* tslint:disable:only-arrow-functions */
$(document).on("click", "a[href^='http']", function (this: HTMLAnchorElement, e: JQueryEventObject) {
    e.preventDefault();
    electron.shell.openExternal(this.href);
}).on("click", "a[href^='#']", function (this: HTMLAnchorElement, e: JQueryEventObject) {
    e.preventDefault();
    e.stopPropagation();
    const top = $($(this).attr("href")).offset().top - 20;
    body.animate({
        scrollTop: top,
    }, 500);
});
/* tslint:enable:only-arrow-functions */

type State = {
    news?: types.NewsCategory[];
    configurationDialogIsVisiable?: boolean;
};

class MainComponent extends React.Component<{}, State> {
    schema: any;
    value: types.ConfigData;
    locale = navigator.language;
    isValid: boolean;
    news: types.NewsCategory[] = [];
    configurationDialogIsVisiable = false;

    updateValue = (value: any, isValid: boolean) => {
        this.value = value;
        this.isValid = isValid;
    }
    reload(n: types.NewsCategory) {
        n.error = undefined;
        this.setState({ news: this.news });
        electron.ipcRenderer.send("reload", n.source);
    }
    hide(item: types.NewsItem) {
        item.hidden = true;
        this.setState({ news: this.news });
        electron.ipcRenderer.send("hide", item.href);
    }
    openAndHide(item: types.NewsItem) {
        electron.shell.openExternal(item.href);
        this.hide(item);
    }
    componentDidMount() {
        electron.ipcRenderer.on("items", (event: Electron.IpcRendererEvent, arg: types.NewsCategory) => {
            const index = this.news!.findIndex(n => n.source === arg.source);
            if (arg.name) {
                arg.key = arg.name.replace(" ", "");
            }
            if (index === -1) {
                this.news!.push(arg);
            } else {
                this.news![index] = arg;
            }
            this.setState({ news: this.news });
        });
        electron.ipcRenderer.on("initialize", (event: Electron.IpcRendererEvent, arg: types.InitialData) => {
            this.schema = arg.schema;
            this.value = arg.startval;
        });
        electron.ipcRenderer.on("error", (event: Electron.IpcRendererEvent, arg: types.ErrorMessage) => {
            alert(arg.message);
        });
        electron.ipcRenderer.send("items");
    }
    toggleConfigurationDialog() {
        this.configurationDialogIsVisiable = !this.configurationDialogIsVisiable;
        this.setState({
            configurationDialogIsVisiable: this.configurationDialogIsVisiable,
        });
    }
    saveConfiguration() {
        electron.ipcRenderer.send("saveConfiguration", this.value);
        this.configurationDialogIsVisiable = false;
        this.setState({
            configurationDialogIsVisiable: this.configurationDialogIsVisiable,
        });
    }
    render() {
        const newsView = this.news!.map(n => {
            if (n.items) {
                const itemsView = n.items.map((i, index) => {
                    let detailView: JSX.Element | undefined = undefined;
                    if (i.detail) {
                        detailView = (
                            <a href={i.detail} className={"btn btn-link" + (i.hidden ? " item-hidden" : "")}>detail</a>
                        );
                    }
                    if (i.hidden) {
                        return (
                            <div key={index}>
                                <a href={i.href} className="btn btn-link item-hidden">{i.title}</a>
                                {detailView}
                            </div>
                        );
                    } else {
                        return (
                            <div key={index}>
                                <a href={i.href} className="btn btn-link">{i.title}</a>
                                {detailView}
                                <button className="btn btn-link" onClick={this.hide.bind(this, i)}>hide</button>
                                <button className="btn btn-link" onClick={this.openAndHide.bind(this, i)}>open and hide</button>
                            </div>
                        );
                    }
                });
                return (
                    <div key={n.source} className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title" id={n.key}>
                                <a href={n.source} className="btn btn-link">{n.name}</a>
                                <button className="btn btn-link" onClick={this.reload.bind(this, n)}>reload</button>
                            </h3>
                        </div>
                        <div className="panel-body">
                            {itemsView}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div key={n.source} className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title" id={n.key}>
                                <a href={n.source} className="btn btn-link">{n.name}</a>
                                <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                                <span>{n.error}</span>
                                <button className="btn btn-link" onClick={this.reload.bind(this, n)}>reload</button>
                            </h3>
                        </div>
                    </div>
                );
            }
        });

        const menuView = this.news!.map(n => {
            let errorView: JSX.Element | undefined = undefined;
            if (!n.items) {
                errorView = (
                    <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                );
            }
            return (
                <li key={n.source}>
                    <a href={"#" + n.key} className="btn btn-link">
                        {n.name}
                        {errorView}
                    </a>
                </li>
            );
        });

        let configurationView: JSX.Element | null = null;
        if (this.schema && this.configurationDialogIsVisiable) {
            configurationView = (
                <div id="configuration" className="configuration bootstrap3-row-container">
                    <JSONEditor schema={this.schema}
                        initialValue={this.value}
                        updateValue={this.updateValue}
                        theme="bootstrap3"
                        icon="bootstrap3"
                        locale={this.locale}
                        hljs={hljs} />
                </div>
            );
        }

        return (
            <div className="container">
                <button className="btn btn-xs menu-configuration" onClick={this.toggleConfigurationDialog.bind(this)}>配置</button>
                <button className={this.configurationDialogIsVisiable ? "btn btn-xs btn-primary menu-save" : "btn btn-xs menu-save btn-primary hidden"} onClick={this.saveConfiguration.bind(this)}>保存</button>
                {configurationView}
                <ul className="menu list-unstyled">{menuView}</ul>
                <div>{newsView}</div>
            </div>
        );
    }
};

ReactDOM.render(<MainComponent />, document.getElementById("container"));
