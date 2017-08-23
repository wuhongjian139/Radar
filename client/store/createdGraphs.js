import {fetchQueryTable} from './queriedTable'
import {queryData} from '../../utils/connectDB'
import {saveSettings, openSettings} from '../../utils/saveFile'
/**
 * ACTION TYPES
 */

export const GET_GRAPHS = 'GET_GRAPHS'
export const ADD_GRAPH = 'ADD_GRAPH'
export const DELETE_GRAPH = 'DELETE_GRAPH'

/**
 * ACTION CREATORS
 */
const getGraphs = graphs => ({type: GET_GRAPHS, graphs})
const addGraph = graph => ({type: ADD_GRAPH, graph})
const deleteGraph = graph => ({type: DELETE_GRAPH, graph})

/**
 * THUNK CREATORS
 */
export const fetchGraphs = () =>
  dispatch => {
    openSettings()
      .then(graphs => {
        const graphsJson = JSON.parse(graphs)
        dispatch(getGraphs(graphsJson))
      })
      .catch(err => (err))
  }

export const saveGraph = (settings) =>
  (dispatch, getState) => {
    const result = queryData(settings.settings)
    result
    .then(response => {
      let newSettings = {...settings}
      newSettings.settings.savedQuery = response[0]
      newSettings.settings.aggregateInformation = response[1]
      return newSettings
    })
    .then(newSettings => {
      dispatch(addGraph(newSettings))
      const updatedGraphs = getState().createdGraphs
      saveSettings(JSON.stringify(updatedGraphs))
    })
    .catch(err => console.log(err))
}

export const removeGraph = (settings) =>
  dispatch => {
    dispatch(deleteGraph(settings))
}

/**
 * REDUCER
 */

export default function (state = [], action) {
  switch (action.type) {
    case GET_GRAPHS:
      return action.graphs
    case ADD_GRAPH:
      return [...state, action.graph]
    case DELETE_GRAPH:
      return state.filter(graph => graph.key !== action.graph.key)
    default:
      return state
  }
}
