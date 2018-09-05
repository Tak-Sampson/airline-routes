import React, { Component } from 'react';
import './App.css';
import data, { getAirlineById, getAirportByCode } from './data.js';

class App extends Component {
  render() {
    const columns = [
      {name: 'Airline', property: 'airline'},
      {name: 'Source Airport', property: 'src'},
      {name: 'Destination Airport', property: 'dest'},
    ];
    const formatValue = (property, value) => (
      (property === 'airline') ? (
        getAirlineById(value).name
      ) : (
        getAirportByCode(value).name
      )
    );

    return (
      <div className="app">
        <header className="header">
          <h1 className="title">Airline Routes</h1>
        </header>
        <section>
          <p>
            Welcome to the app!
          </p>
          <Table 
            className="routes-table" 
            columns={columns} 
            rows={data.routes} 
            format={formatValue}
            perPage={25} 
          />
        </section>
      </div>
    );
  }
}

class Table extends Component {
  state = {
    offset: 0,
    airline: '',
    airport: '',
  }

  canPrev = () => {
    return this.state.offset >= this.props.perPage;
  }

  canNext = () => {
    return this.state.offset < this.filteredRows().length - this.props.perPage;
  }

  handlePrevClick = () => {
    if (!this.canPrev()) return;
    this.setState({
      offset: this.state.offset - this.props.perPage
    });
  }

  handleNextClick = () => {
    if (!this.canNext()) return;
    this.setState({
      offset: this.state.offset + this.props.perPage
    });
  }

  filteredAirlines = () => {
    const code = this.state.airport;
    return data.airlines.map(airline => {    
      const routes = this.props.rows.filter(r => r.airline === airline.id);    
      return (routes.some(r => ['', r.src, r.dest].some(c => c === code))) ? (
        { match: true, airline: airline.name, id: airline.id }
      ) : (
        { match: false, airline: airline.name, id: airline.id }
      );
    });
  }

  filteredAirports = () => {
    const id = this.state.airline;
    return data.airports.map(airport => {
      const routes = this.props.rows.filter(r => (
        airport.code === r.src || airport.code === r.dest
      ));
      return (routes.some(r => String(r.airline) === id || id === '')) ? (
        { match: true, airport: airport.name, code: airport.code }
      ) : (
        { match: false, airport: airport.name, code: airport.code }
      );
    });
  }

  handleAirlineSelect = (e) => {
    this.setState({
      offset: 0,
      airline: e.target.value,
    });
  }

  handleAirportSelect = (e) => { 
    this.setState({
      offset: 0,
      airport: e.target.value,
    });
  }

  resetState = () => {
    this.setState({
      offset: 0,
      airline: '',
      airport: '',
    });
  }

  filteredRows = () => {
    return this.props.rows.filter(route => (
      (this.state.airline === '' || 
        this.state.airline === String(route.airline)) &&
      (this.state.airport === '' || 
        this.state.airport === route.src || 
        this.state.airport === route.dest)
    ));
  }

  render () {
    const lower = this.state.offset;
    const upper = this.state.offset + this.props.perPage;
    const rows = this.filteredRows();
    return (
      <div>
        <p>
          Show routes on 
          <Select 
            options={this.filteredAirlines()}
            valueKey='id'
            titleKey='airline'
            allTitle='All Airlines'
            value={this.state.airline}
            onSelect={this.handleAirlineSelect}
            foo={this.state.airport}
          />
          flying in or out of 
          <Select 
            options={this.filteredAirports()}
            valueKey='code'
            titleKey='airport'
            allTitle='All Airports'
            value={this.state.airport}
            onSelect={this.handleAirportSelect}
            foo={this.state.airport}
          />
          <button
            onClick={this.resetState}
          >Show all routes</button>
        </p>
        <table className='routes-table'>
          <thead>
            <tr>
              {
                this.props.columns.map(col => (
                  <th>
                    {col.name}
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            { 
              rows.slice(lower, upper).map(row => (
                <tr>
                  { this.props.columns.map(col => (
                    <td>
                      { this.props.format(col.property, row[col.property]) }
                    </td>
                  )) }
                </tr>
              )) 
            }
          </tbody>
        </table>
        <div>
          <p>
            Showing {lower + 1}-{Math.min(upper, rows.length)} of {rows.length} routes.
          </p>
          <button
            disabled={!this.canPrev()}
            onClick={this.handlePrevClick}
          >
            Previous Page
          </button>
          <button
            disabled={!this.canNext()}
            onClick={this.handleNextClick}
          >
            Next Page
          </button>
        </div>
      </div>
    );
  }
}

class Select extends Component {
  render() { 
    return(
      <select
        onChange={this.props.onSelect}
        value={this.props.value}
      >
        <option
          key={this.props.value}
          value={this.props.value}
        >
          {this.props.allTitle}
        </option>
        {
          this.props.options.map(row => (
            <option
              key={row[this.props.valueKey]}
              value={row[this.props.valueKey]}
              disabled={!row.match}
            >
              {row[this.props.titleKey]}
            </option>
          ))
        }
      </select>
    );
  }
}

export default App;