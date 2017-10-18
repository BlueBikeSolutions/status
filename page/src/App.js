import { Badge, Card, Col, Collapse, Layout, Popover, Row, Spin } from 'antd'
import moment from 'moment'
import React, { Component } from 'react'

import 'antd/dist/antd.min.css'
import './App.css'

const { Header, Content } = Layout


function undef(value) { return typeof value === 'undefined' }


class ReleaseRow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      services: [],
    }
  }
  componentWillMount() {
    fetch(`/${this.props.release.id}.json`).then(
      resp => resp.json().then(release => {
        const time = moment(release.time)
        setInterval(() => {
          this.setState({
            timeTextRelative: time.fromNow(),
            timeTextAbsolute: time.format('MMMM Do YYYY, h:mm:ss a'),
          })
        }, 1000)
        this.setState({
          loading: false,
          okay: Object.values(release.services).every(service => service.okay),
          timeTextRelative: time.fromNow(),
          timeTextAbsolute: time.format('MMMM Do YYYY, h:mm:ss a'),
          ...release,
        })
      })
    )
  }

  badgeStatus = () => {
    if (this.state.loading) return 'processing'
    if (this.state.okay) return 'success'
    return 'error'
  }

  render() {
    const { release, ...otherProps } = this.props
    return <Collapse.Panel
      key={ release.id }
      { ...otherProps }
      header={
        <div style={{ display: 'flex', paddingRight: '1em' }}>
          <div style={{ flexGrow: 1 }}>
            <Badge
              status={ this.badgeStatus() }
              text={ release.name }
            />
          </div>
          <div style={{ flexShrink: 1 }}>
            <Popover content={ this.state.timeTextAbsolute }>
              <a>
                { this.state.timeTextRelative }
              </a>
            </Popover>
          </div>
        </div>
      }
    >
      <Spin spinning={ this.state.loading }>
        { this.state.loading ? null : <Row gutter={ 12 }>
          { Object.entries(this.state.services)
              .map(([id, { okay, errors }]) =>
                <Col
                  key={ id }
                  span={ 6 } style={{ margin: '6px 0px' }}
                >
                  <Card
                    title={ <Badge
                      status={ okay ? 'success' : 'error' }
                      text={ id }
                    /> }
                  >
                    { okay ?
                      <p>No issues detected</p> :
                      errors.map(message => <p>{ message }</p>)
                    }
                  </Card>
                </Col>
              )
          }
        </Row> }
      </Spin>
    </Collapse.Panel>
  }
}


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingReleases: true,
      releases: [],
    }
  }
  componentWillMount() {
    fetch('/services.json').then(
      resp => resp.json().then(releases => {
        this.setState({
          loadingReleases: false,
          releases: releases,
        })
      })
    )
  }

  render() {
    return <Layout>
      <Header>
        <h1>Service Status</h1>
      </Header>

      <Spin spinning={ this.state.loadingReleases }>
        <Content style={{ padding: '50px' }}>
          <div style={{
            background: '#fff',
            padding: 24,
            minHeight: 280,
          }}>
            <Collapse>
              { this.state.releases.map(release =>
                <ReleaseRow release={ release } />
              ) }
            </Collapse>
          </div>
        </Content>
      </Spin>
    </Layout>
  }
}

export default App
