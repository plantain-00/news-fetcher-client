import * as $ from "jquery";
import * as electron from "electron";
import * as React from "react";
import * as types from "../types";
import * as ReactDOM from "react-dom";

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

}

let MainComponent = React.createClass({
    getInitialState: function() {
        return {
            news: []
        } as State;
    },
    componentDidMount: function() {
        let self: Self = this;

        electron.ipcRenderer.on(types.events.items, (event, arg) => {
            let news = self.state.news;
            news.push(arg);
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
                            <a href={i.detail} className="btn btn-link">detail</a>
                        );
                    }
                    return (
                        <div key={index}>
                            <a href={i.href} className="btn btn-link">{i.title}</a>
                            <button className="btn btn-link">hide</button>
                            {detailView}
                        </div>
                    );
                });
                return (
                    <div key={n.source}>
                        <div>
                            <a href={n.source} className="btn btn-link">{n.source}</a>
                        </div>
                        {itemsView}
                    </div>
                );
            } else {
                return (
                    <div key={n.source}>
                        <div>
                            <a href={n.source} className="btn btn-link">{n.source}</a>
                            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
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
