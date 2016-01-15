import Cycle    from '@cycle/core';
import {Observable} from 'rx';
import {makeDOMDriver, hJSX} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

import './sass/main.scss';

function main(sources) {
  const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=';

  const searchRequest$ = sources.DOM.select('.field').events('input')
    .debounce(500)
    .map(ev => ev.target.value)
    .filter(query => query.length > 0)
    .map(q => `${GITHUB_SEARCH_API}${encodeURI(q)}`)

  const otherRequest$ = Observable.interval(1000).take(2)
    .map(() => 'http://www.google.com');

  const vtree$ = sources.HTTP
    .filter(res$ => res$.request.url.indexOf(GITHUB_SEARCH_API) === 0)
    .flatMap(x => x)
    .map(res => res.body.items)
    .startWith([])
    .map(results =>
      <div>
        <label className="label">Search: </label>
        <input className="field" type="text" />
        <hr/>
        <ul>
          {
            results.map(result =>
              <li className="search-result">
                <a href={result.html_url}>{result.name}</a>
              </li>
            )
          }
        </ul>
      </div>
    )

  const request$ = searchRequest$.merge(otherRequest$);

  return {
    DOM: vtree$,
    HTTP: request$
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
});
