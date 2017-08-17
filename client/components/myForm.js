import React from 'react'
import { connect } from 'react-redux'
import { fetchUsers, fetchDatabase, searchDatabase, fetchFields, fetchDatabases,fetchTables, currentDatabase, fetchGraphs, saveGraph, fetchQueryTable } from '../store'
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'
import {FormControl, ControlLabel, FormGroup} from 'react-bootstrap'
import {saveFile} from '../../utils/saveFile'

class myForm extends React.Component {

  constructor() {
    super()
    this.state = {
      selectThese: [],
      whereThese: [],
      orderedBy: ['Descending', 0 ],
      conditionals : ['greater than', 'greater than or equal to', 'less than', 'less than or equal to','equal to', 'not', 'between', 'not between'],
      conditionalOperator: ['>', '>=', '<', '<=', '=', '!=', '[]', '![]'],
      orderType : ['None','Ascending', 'Descending'],
      chartTypes: ['Pie', 'Scatter', 'Donut', 'Bar', 'Line'],
      currentTable : '',
      currentDatabase : '',
      AndOr: 'AND',
      choosenChart: '',
      Title: '',
      xAxis: '',
      yAxis: '',
      height: '',
      width: '',
    }
  }

  componentDidMount() {
    let db = this.props.match.params.dbName
    this.setState({currentDatabase: db})
    this.props.fetchDat({ database: db})
    this.props.loadCreatedGraphs()
    if(this.props.tables) this.setState({currentTable: this.props.tables[0]})
  }


  handleChange = (index, fromWhere, evt ) => {
    const type = evt.target.name
    const value = evt.target.value
    let newVal = (fromWhere === 'whereThese') ? {} : value
    if(fromWhere === 'whereThese'){
      if(type === 'is'){
        newVal[type] = this.state.conditionalOperator[value]
        newVal.literal = value
      }
      else newVal[type] = value
    }

    this.setState( (prevState) => ( { [fromWhere]: prevState[fromWhere].map( (val, i) => {
        if (index != i ) return val
        if (fromWhere === 'whereThese'){
          return {...val, ...newVal}
        }
        return newVal;
    })}))
  }

  handleChartChange = (fromWhere, evt) => {
    this.setState({
      [fromWhere]: evt.target.value
    })
  }

  handleAdd = (addTo, evt) => {
    let newAdd = (addTo === 'selectThese') ? this.props.columns[0] : {col:this.props.columns[0], is: '>', spec: '' , literal:'greater than'}
    this.setState( (prevState) => ({ [addTo]: [...prevState[addTo], newAdd] }))
  }

  handleRemove = (index, fromWhere, evt) => {
    this.setState( (prevState) => ({
      [fromWhere]: [...prevState[fromWhere].slice(0, index), ...prevState[fromWhere].slice(index + 1)]
    }))
  }



  makeGraph = (evt) => {
    evt.preventDefault()
    this.props.queryDatabase(this.state)
    const newGraph = <div>New Graph for Database: {this.state.currentDatabase} Table: {this.state.currentTable}</div>  // null
    this.props.savingGraph(this.state.currentDatabase, this.state.currentTable, newGraph)  // second argument should be settings of graph
  }

  handleTableChange = (evt) => {
    const currentTable = evt.target.value
    this.setState({ currentTable: currentTable })
    this.props.grabTableData(this.state.currentDatabase, currentTable)
    this.props.loadCreatedGraphs()
  }
  renderTables = () => {
      return <div>
                <label>From</label>
                  <select name="From" onChange={this.handleTableChange}>
                    <option>Choose a Table</option>
                    {this.props.tables && this.props.tables.map((table,i) => <option value={table} key={i}>{table}</option>)}
                  </select>
              </div>
  }

  renderSelects = () => {
      return <div>
                <label>Select</label>
                { this.state.selectThese.map((sel, index) => {
                    return  <div key={index}>
                                <select key={index} onChange={this.handleChange.bind(this, index, 'selectThese')} value={this.state.selectThese[index]}>
                                    {this.props.columns && this.props.columns.map((val,i) => <option value={val} key={i}>{val}</option>)}
                                </select>
                                <button type="button" className="btn btn-danger" onClick={this.handleRemove.bind(this, index, 'selectThese')}> - </button>
                            </div>
                    })
                }
                <button type="button" className="btn btn-primary" onClick={this.handleAdd.bind(this,'selectThese')} disabled={(this.state.selectThese.length) === (this.props.columns.length-1)}>+</button>
            </div>
  }

  renderWheres = () => {
    return  <div>
              <label>Where</label>
              { (this.state.whereThese.length > 1) && (<div>
                      <input type="radio" className="form-check-input" name="AndOr" value="AND" onChange={this.handleChartChange.bind(this, 'AndOr')} checked/>
                      And <br />
                      <input type="radio" className="form-check-input" name="AndOr" value="OR" onChange={this.handleChartChange.bind(this, 'AndOr')} />
                      Or <br />
                    </div>)
              }
              {
                this.state.whereThese.map((sel, index) => {
                  return  <div key={index}>
                            <select name="col" onChange={this.handleChange.bind(this, index, 'whereThese')} value={this.state.whereThese[index].col}>
                              {this.props.columns && this.props.columns.map((val, i)  => <option value={val} key={i}>{val}</option>)}
                            </select>
                            <h4>is</h4>
                              <select name="is" onChange={this.handleChange.bind(this, index, 'whereThese')} value={this.state.whereThese[index].literal}>
                              {this.state.conditionals && this.state.conditionals.map((val, i) => <option value={i} key={i}>{val}</option>)}
                              </select>
                              <input  name="spec" 
                                      onChange={this.handleChange.bind(this, index, 'whereThese')}
                                      value={this.state.whereThese[index].spec}/>
                              <button type="button" className="btn btn-danger" onClick={this.handleRemove.bind(this, index, 'whereThese')}> - </button>
                          </div>
                })
              }
                <button type="button" className="btn btn-primary" onClick={this.handleAdd.bind(this, 'whereThese')} disabled={this.state.whereThese.length === 4}>+</button>
            </div>
  }

  renderOrderBy = () =>  {
    return <div className="form-group">
            <label>Order by</label>
            {
              <select onChange={this.handleChange.bind(this, 0, 'orderedBy')}>
               { this.state.orderType.map((val,i) => <option value={val} key={i}>{val}</option>) }
              </select>
            }
            {
              <select onChange={this.handleChange.bind(this, 1, 'orderedBy')}>
                { this.options() }
              </select>
            }
          </div>
  }

  options = () => {
    return  this.state.selectThese.length
            ? this.state.selectThese.map( (val, index) => <option value={val} key={index}>{val}</option>)
            : (this.props.columns && this.props.columns.map( (val, index) => <option value={val} key={index}>{val}</option>) )
  }

  render () {
    const DBName = this.props.match.params.dbName
    return (
      <div>
        <h2>User {DBName} Query Selection Form</h2>
        <form>
            { this.renderTables() }
            { this.state.currentTable && this.renderSelects()} 
            { this.state.currentTable && this.renderWheres() }
            { this.state.currentTable && this.renderOrderBy() }
        </form>
        <h2>Chart choice</h2>
        <form>
            <label>Chart Type</label>
              <select name='choosenChart' onChange={this.handleChartChange.bind(this, 'choosenChart')} >
               {this.state.chartTypes.map((val,i) => <option value={val} key={i}>{val}</option>)}
              </select>
            <label>Chart Title</label>
            <input className="form-control" onChange={this.handleChartChange.bind(this, 'Title')}/>

            <label>Height</label>
            <input className="form-control" onChange={this.handleChartChange.bind(this, 'height')}/>

            <label>Width</label>
            <input className="form-control" onChange={this.handleChartChange.bind(this, 'width')}/>

            <label>X axis</label>
            <select onChange={this.handleChartChange.bind(this, 'xAxis')}>
               { this.options() }
            </select>
            <label>Y axis</label>
            <select onChange={this.handleChartChange.bind(this, 'yAxis')} >
               { this.options() }
            </select>
          <button type="submit" className="btn btn-success" onClick={this.makeGraph}>Make my graph</button>
        </form>
        {
          this.props.createdGraphs &&
          this.props.createdGraphs
          .filter(graphInfo => {
            return !(this.state.currentTable)
                    ? graphInfo.database === DBName
                    : (graphInfo.database === DBName && graphInfo.table === this.state.currentTable)
          })
          .map(graphInfo => graphInfo.graph)
        }
        {
          this.props.database && this.props.database.map(data => <li key={data.id}>{JSON.stringify(data)}</li>)
        }    
        <div>
    <button id="saveFile" onClick={saveFile}>Save Graph</button>
    </div>
      </div>
    )
  }
}

const mapState = state => {
  return ({
    tables: state.tables,
    columns: state.fields.map(val => val.name),
    createdGraphs: state.createdGraphs,
    database: state.queriedTable
  })
}

const mapDispatch = dispatch => {
  return ({
    fetchDat (DBname) {
      dispatch( fetchTables(DBname) )
    },
    grabTableData(database, table) {
      dispatch( fetchFields({ database, table}))
    },
    loadCreatedGraphs(){
      dispatch(fetchGraphs())
    },
    savingGraph(currentDatabase, currentTable, graph){  // settings of graph applied to newSettings
      let newGraphInfo = {
        database: currentDatabase,
        table: currentTable,
        graph: graph
      }
      dispatch(saveGraph(newGraphInfo))
    },
    queryDatabase(settings){
      dispatch(fetchQueryTable(settings))
    }
  })
}

export default connect(mapState, mapDispatch)(myForm)
