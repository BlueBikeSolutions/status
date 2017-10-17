import { Badge, Card, Col, Collapse, Layout, Row, Spin } from 'antd'
import React, { Component } from 'react'

import 'antd/dist/antd.min.css'
import './App.css'

const { Header, Content } = Layout


function undef(value) { return typeof value === 'undefined' }


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingServices: true,
      services: [],
    }
  }
  componentWillMount() {
    fetch('/services.json').then(
      resp => resp.json().then(data => {
        this.setState({
          loadingServices: false,
          services: data.map(inner => ({
            loading: true,
            parts: {},
            ...inner
          })),
        })
        data.forEach((inner, idx) => {
          fetch(`/${ inner.id }.json`).then(resp => resp.json().then(parts => {
            const newServices = [...this.state.services]
            newServices[idx] = {
              ...newServices[idx],
              loading: false,
              okay: Object.values(parts).every(part => part.okay),
              parts,
            }
            this.setState({ services: newServices })
          }))
        })
      })
    )
  }

  render() {
    return <Layout>
      <Header>
        <h1>Service Status</h1>
      </Header>

      <Spin spinning={ this.state.loadingServices }>
        <Content style={{ padding: '50px' }}>
          <div style={{
            background: '#fff',
            padding: 24,
            minHeight: 280,
          }}>
            <Collapse>
              { this.state.services.map(data =>
                <Collapse.Panel
                  key={ data.id }
                  header={
                    <Badge
                      status={ undef(data.okay) ? 'processing' : data.okay ? 'success' : 'error' }
                      text={ data.name }
                    />
                  }
                ><Spin spinning={ data.loading }>
                    { data.loading ? null : <Row gutter={ 12 }>
                      { Object.entries(data.parts).map(([id, { okay, errors }]) =>
                        <Col span={ 6 } style={{ margin: '6px 0px' }} ><Card title={ <Badge
                          status={ okay ? 'success' : 'error' }
                          text={ id }
                        /> }>
                          { okay ?
                              <p>No issues detected</p> :
                              errors.map(message => <p>{ message }</p>)
                          }
                        </Card></Col>
                      ) }
                    </Row> }
                </Spin></Collapse.Panel>
              ) }
            </Collapse>
          </div>
        </Content>
      </Spin>
    </Layout>
  }
}

export default App
