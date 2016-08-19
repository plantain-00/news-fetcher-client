/// <reference types="json-editor" />
import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";

(window as any)["jQuery"] = $;
require("bootstrap");
require("json-editor");

const body = $("html,body");
let editor: JSONEditor<types.Config>;

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

type InitData = {
    schema: any;
    startval: types.Config;
}

type News = {
    name: string;
    source: string;
    items: types.Item[];
    error: string | null;
    key: string;
}

type State = {
    news?: News[];
    configurationDialogIsVisiable?: boolean;
}

class MainComponent extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            news: [],
            configurationDialogIsVisiable: false,
        };
    }
    public reload(n: News) {
        n.error = null;
        this.setState({ news: this.state.news });
        electron.ipcRenderer.send(types.events.reload, n.source);
    }
    public hide(item: types.Item) {
        item.hidden = true;
        this.setState({ news: this.state.news });
        electron.ipcRenderer.send(types.events.hide, item.href);
    }
    public openAndHide(item: types.Item) {
        electron.shell.openExternal(item.href);
        this.hide(item);
    }
    public componentDidMount() {
        electron.ipcRenderer.on(types.events.items, (event: Electron.IpcRendererEvent, arg: News) => {
            const index = this.state.news!.findIndex(n => n.source === arg.source);
            if (arg.name) {
                arg.key = arg.name.replace(" ", "");
            }
            if (index === -1) {
                this.state.news!.push(arg);
            } else {
                this.state.news![index] = arg;
            }
            this.setState({ news: this.state.news });
        });
        electron.ipcRenderer.on(types.events.initialize, (event: Electron.IpcRendererEvent, arg: InitData) => {
            editor = new JSONEditor(document.getElementById("configuration") !, {
                theme: "bootstrap3",
                iconlib: "bootstrap3" as any as boolean,
                disable_collapse: true,
                disable_edit_json: true,
                disable_properties: true,
                schema: arg.schema,
                startval: arg.startval,
            });
        });
        electron.ipcRenderer.send(types.events.items);
    }
    public toggleConfigurationDialog() {
        this.setState({
            configurationDialogIsVisiable: !this.state.configurationDialogIsVisiable,
        });
    }
    public saveConfiguration() {
        electron.ipcRenderer.send(types.events.saveConfiguration, editor.getValue());
        this.setState({
            configurationDialogIsVisiable: false,
        });
    }
    public render() {
        const newsView = this.state.news!.map(n => {
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
                            <h3 className="panel-title"id={n.key}>
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

        const menuView = this.state.news!.map(n => {
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

        return (
            <div className="container">
                <button className="btn btn-xs menu-configuration" onClick={this.toggleConfigurationDialog.bind(this)}>配置</button>
                <button className={this.state.configurationDialogIsVisiable ? "btn btn-xs btn-primary menu-save" : "btn btn-xs menu-save btn-primary hidden"} onClick={this.saveConfiguration.bind(this)}>保存</button>
                <div id="configuration" className={this.state.configurationDialogIsVisiable ? "configuration" : "configuration hidden"}>
                </div>
                <ul className="menu list-unstyled">{menuView}</ul>
                <div>{newsView}</div>
            </div>
        );
    }
};

ReactDOM.render(<MainComponent />, document.getElementById("container"));
