import React from 'react';
import SearchBox from './search-box';
import TableResults from './table-results';
import parse from './../models/items';
import debounce from 'lodash/debounce';
import { getData } from '../utils/xhr';
import { MORFIX_URL }  from '../consts';
import axios from 'axios';
import { getSelection } from '../utils/dom';

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            searchText: '',
            loading: false,
            error: false,
            direction: 'rtl',
            items: [],
            suggestions: [],
            directionSuggestions: 'rtl'
        };
        this.requestDebounce = debounce(this.request, 500);
    }

    async componentDidMount() {
        try{
            const searchText = await getSelection();
            this.setState({searchText}, () => this.request());
        }
        catch(ex){
            throw ex;
        }
    }

    async request() {
        const { searchText } = this.state;

        if (searchText.trim()) {
            this.setState({loading: true});

            this.axiosSource && this.axiosSource.cancel('abort');
            this.axiosSource = axios.CancelToken.source();

            try{
                const result = await getData(searchText, this.axiosSource.token);
                let data = parse(result.data, this.state.direction, this.state.directionSuggestions);
                console.log(data);
                this.setState({
                    loading: false,
                    items: data.items,
                    suggestions: data.suggestions,
                    direction: data.direction,
                    directionSuggestions: data.directionSuggestions
                });
            }
            catch(ex){
                if (ex.message !== 'abort') {
                    this.setState({loading: false, error: true});
                }
            }

        }
        else {
            this.setState({items: [], suggestions: []});
        }
    }

    onChangeSearch(value, focus = false) {
        let loading = !!value.trim();
        this.setState({searchText: value, loading, items: [], suggestions: []});
        this.search();
        if (focus) {
            let el = this.searchBoxComp && this.searchBoxComp.searchInput;
            if(el){
                el.focus();
            }
        }
    }

    search() {
        //debounced in constructor
        this.requestDebounce();
    }

    render() {
        let linkFooter = this.state.searchText.trim() ?
            <div className="footer-link"><a href={MORFIX_URL + this.state.searchText} target="_blank"><img
                src="/icons/icon16.png" alt=""/>&nbsp;Morfix</a></div> : '';


        return (
            <div className="morfix">
                <SearchBox
                    ref={r => this.searchBoxComp = r}
                    onChangeSearch={this.onChangeSearch.bind(this)}
                    searchText={this.state.searchText}
                />
                <TableResults
                    items={this.state.items}
                    suggestions={this.state.suggestions}
                    onChangeSearch={this.onChangeSearch.bind(this)}
                    direction={this.state.direction}
                    directionSuggestions={this.state.directionSuggestions}
                    loading={this.state.loading}
                    searchText={this.state.searchText}
                />
                {linkFooter}
            </div>
        );
    }
}

export default App;