import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";
import * as settings from "../settings";

window["jQuery"] = $;
require("bootstrap");

$(document).on("click", "a[href^='http']", function(event) {
    event.preventDefault();
    electron.shell.openExternal(this.href);
});

interface State {
    news?: types.News[];
}

interface Self extends types.Self<State> {
    reload: (n: types.News) => void;
    hide: (item: types.Item) => void;
    openAndHide: (item: types.Item) => void;
}

let MainComponent = React.createClass({
    reload: function(n: types.News) {
        let self: Self = this;

        electron.ipcRenderer.send(types.events.reload, n.source);
    },
    hide: function(item: types.Item) {
        let self: Self = this;

        let news = self.state.news;
        item.hidden = true;
        self.setState({ news: news });
        electron.ipcRenderer.send(types.events.hide, item.href);
    },
    openAndHide: function(item: types.Item) {
        let self: Self = this;

        electron.shell.openExternal(item.href);
        self.hide(item);
    },
    getInitialState: function() {
        return {
            news: []
        } as State;
    },
    componentDidMount: function() {
        let self: Self = this;

        electron.ipcRenderer.on(types.events.items, (event, arg) => {
            let news = self.state.news;
            let index = news.findIndex(n => n.source === arg.source);
            if (index === -1) {
                news.push(arg);
            } else {
                news[index] = arg;
            }
            self.setState({ news: news });
        });
        electron.ipcRenderer.send(types.events.items);
    },
    render: function() {
        let self: Self = this;

        let newsView = self.state.news.map(n => {
            if (n.items) {
                let itemsView = n.items.map((i, index) => {
                    let detailView;
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
                                <button className="btn btn-link" onClick={self.hide.bind(this, i)}>hide</button>
                                <button className="btn btn-link" onClick={self.openAndHide.bind(this, i)}>open and hide</button>
                            </div>
                        );
                    }
                });
                return (
                    <div key={n.source} className="panel panel-default row">
                        <div className="panel-heading">
                            <h3 className="panel-title">
                                <a href={n.source} className="btn btn-link">{n.source}</a>
                                <button className="btn btn-link" onClick={self.reload.bind(this, n)}>reload</button>
                            </h3>
                        </div>
                        <div className="panel-body">
                            {itemsView}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div key={n.source} className="panel panel-default row">
                        <div className="panel-heading">
                            <h3 className="panel-title">
                                <a href={n.source} className="btn btn-link">{n.source}</a>
                                <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                                <button className="btn btn-link" onClick={self.reload.bind(this, n)}>reload</button>
                            </h3>
                        </div>
                    </div>
                );
            }
        });

        return (
            <div>{newsView}</div>
        );
    },
});

ReactDOM.render(<MainComponent/>, document.getElementById("container"));
