import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";

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
}

interface Self extends types.Self<State> {
    reload: (n: types.News) => void;
    hide: (item: types.Item) => void;
    openAndHide: (item: types.Item) => void;
}

class MainComponent extends React.Component<any, State> {
    public reload(this: Self, n: types.News) {
        const news = this.state!.news;
        n.error = null;
        this.setState!({ news });
        electron.ipcRenderer.send(types.events.reload, n.source);
    }
    public hide(this: Self, item: types.Item) {
        const news = this.state!.news;
        item.hidden = true;
        this.setState!({ news });
        electron.ipcRenderer.send(types.events.hide, item.href);
    }
    public openAndHide(this: Self, item: types.Item) {
        electron.shell.openExternal(item.href);
        this.hide!(item);
    }
    public getInitialState() {
        return {
            news: [],
        } as State;
    }
    public componentDidMount(this: Self) {
        electron.ipcRenderer.on(types.events.items, (event: Electron.IpcRendererEvent, arg: types.News) => {
            const news = this.state!.news!;
            const index = news.findIndex(n => n.source === arg.source);
            if (arg.name) {
                arg.key = arg.name.replace(" ", "");
            }
            if (index === -1) {
                news.push(arg);
            } else {
                news[index] = arg;
            }
            this.setState!({ news: news });
        });
        electron.ipcRenderer.send(types.events.items);
    }
    public render(this: Self) {
        const newsView = this.state!.news!.map(n => {
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

        const menuView = this.state!.news!.map(n => {
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
                <ul className="menu list-unstyled">{menuView}</ul>
                <div>{newsView}</div>
            </div>
        );
    }
};

ReactDOM.render(<MainComponent /> as any, document.getElementById("container") !);
