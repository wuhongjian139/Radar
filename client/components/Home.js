import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {fetchDatabases} from '../store'
import {Jumbotron, Button, Image, Collapse, Well} from'react-bootstrap'
import logo from '../../public/70685-radar-chart.png'
import infographic from '../../public/db-logo.png'


class Home extends Component {
  
  constructor () {
    super()
    this.state = {}
  }
  
  componentDidMount() {
    this.props.loadDatabases()
  }
  
  render() {
    
    const {databases} = this.props
    const wellStyles = {maxWidth: 400, margin: '0 auto 10px', backgroundColor: '#36454f'}
    const listDatabases = () => {
      return databases && databases.map(database => {
        return (
          <div className="dbList" key={database.datname}>
            <Link to={`/form/${database.datname}`} className="links">
              <div className="col-md-4" style={{textAlign: 'left'}}>
                <div>
                <Image src={infographic} circle style={{width: 20 + '%', height: 20 + '%'}}/>
                </div>
              </div>
              <div>
                {database.datname}
              </div>
            </Link>
          </div>
        )
      })
    }
    
    return (
      <div className="container">
        <div className="row">
          <div className="row">
            <div className="row">
              <div className="col-lg-12">
                <Jumbotron style={{height: 7  + 'em', fontSize: 2 + 'em', marginTop: 0 + 'em'}}>
                  <Image src={logo} circle
                         style={{float: 'left', marginRight: '0.5' + 'em', width: 5 + 'em', height: 5 + 'em'}}/>
                  <h1 style={{display: 'inline-block'}}>Radar</h1>
                  <p>A Postgres.app utility application that will help you visualize your data</p>
                </Jumbotron>
              </div>
              <div className="col-lg-12">
                <div className="well" style={wellStyles}>
                  <Button style={{backgroundColor: '#E84A5F', color: 'white'}} bsSize="large" block onClick={() => this.setState({open: !this.state.open})}>
                    {this.state.open ? 'hide databases' : 'render databases'}
                  </Button>
                </div>
                {this.state.open ? listDatabases() : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapState = (state) => {
  return {
    databases: state.databases
  }
}

const mapDispatch = dispatch => {
  return {
    loadDatabases() {
      dispatch(fetchDatabases())
    }
  }
}
export default connect(mapState, mapDispatch)(Home)

