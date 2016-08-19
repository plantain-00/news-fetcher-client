/// <reference types="json-editor" />
import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";
require("json-editor");

(window as any)["jQuery"] = $;
require("bootstrap");

const body = $("html,body");

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

interface State {
    news?: types.News[];
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
    public reload(n: types.News) {
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
        electron.ipcRenderer.on(types.events.items, (event: Electron.IpcRendererEvent, arg: types.News) => {
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
        electron.ipcRenderer.send(types.events.items);
    }
    public toggleConfigurationaaDialog() {
        this.setState({
            configurationDialogIsVisiable: !this.state.configurationDialogIsVisiable,
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
                <button className="btn btn-xs menu-configuration" onClick={this.toggleConfigurationaaDialog.bind(this)}>配置</button>
                <div id="configuration" className={this.state.configurationDialogIsVisiable ? "configuration" : "configuration hidden"}>
                </div>
                <ul className="menu list-unstyled">{menuView}</ul>
                <div>{newsView}</div>
            </div>
        );
    }
};

ReactDOM.render(<MainComponent /> as any, document.getElementById("container"));

const editor = new JSONEditor(document.getElementById("configuration") !, {
    theme: "bootstrap3",
    iconlib: "bootstrap3" as any as boolean,
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true,
    schema: {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "配置",
        "description": "同步配置",
        "type": "object",
        "properties": {
            "willSync": {
                "type": "boolean",
                "description": "是否开启同步，如果不开启同步，历史纪录会保存在本地",
                "default": false,
            },
            "key": {
                "type": "string",
                "description": "密钥",
                "default": "",
            },
            "serverUrl": {
                "type": "string",
                "description": "服务器地址",
                "default": "",
            },
        },
        "required": ["willSync"],
    },
});

editor.getValue();
