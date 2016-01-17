import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";

$(document).on("click", "a[href^='http']", function(event) {
    event.preventDefault();
    electron.shell.openExternal(this.href);
});

interface State {
    news?: types.News[];
}

interface Self extends types.Self<State> {

}

let MainComponent = React.createClass({
    getInitialState: function() {
        return {
            news: []
        } as State;
    },
    componentDidMount: function() {
        let self: Self = this;

        electron.ipcRenderer.on(types.sources.v2ex_hot, (event, arg) => {
            let news = self.state.news;
            news.push({
                source: types.sources.v2ex_hot,
                items: arg,
            });
            self.setState({ news: news });
        });
        electron.ipcRenderer.send(types.sources.v2ex_hot);

        electron.ipcRenderer.on(types.sources.kickass_torrents, (event, arg) => {
            let news = self.state.news;
            news.push({
                source: types.sources.kickass_torrents,
                items: arg,
            });
            self.setState({ news: news });
        });
        electron.ipcRenderer.send(types.sources.kickass_torrents);

        electron.ipcRenderer.on(types.sources.eztv, (event, arg) => {
            let news = self.state.news;
            news.push({
                source: types.sources.eztv,
                items: arg,
            });
            self.setState({ news: news });
        });
        electron.ipcRenderer.send(types.sources.eztv);
    },
    render: function() {
        let self: Self = this;

        let newsView = self.state.news.map(n => {
            let itemsView = n.items.map((i, index) => {
                return (
                    <div key={index}><a href={i.href}>{i.title}</a></div>
                );
            });
            return (
                <div key={n.source}>
                    <div><a href={n.source}>{n.source}</a></div>
                    {itemsView}
                </div>
            );
        });

        return (
            <div>{newsView}</div>
        );
    },
});

ReactDOM.render(<MainComponent/>, document.getElementById("container"));
