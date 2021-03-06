/* @flow */
'use strict';
import React, {Component,PropTypes} from 'react';
import ReactNative, {
    StyleSheet,
    Text,
    View,
    ScrollView,
    WebView,
    TouchableOpacity,
    Image,
    Platform,
    Linking
} from 'react-native';

import {navbarHeight,screenHeight} from '../../util';
// import {httpHeader} from '../../configure';
// import {userManager} from '../../util/XGlobal';
import ExceptionView, {ExceptionType} from '../ExceptionView';
import {connect} from 'react-redux';
import { navigatePush, navigatePop, navigateRefresh } from '../../redux/actions/nav';
// import Alipay from 'react-native-payment-alipay';

const UIManager = require('UIManager');
const WEBVIEW_REF = 'webview';

// const noWifi = require('../../../source/img/xy_nowifi/xy_nowifi.png');
class BaseWebView extends Component {

    constructor(props:Object){
        super(props);
        this.state = {
            status:"No Page Loaded",
            backButtonEnabled:false,
            forwardButtonEnabled:false,
            loading: true,
            scalesPageToFit:true,
        };
    }

    state: {
        status:string,
        backButtonEnabled:bool,
        forwardButtonEnabled:bool,
        loading:bool,
        scalesPageToFit:bool,
    };

    static propTypes = {
        url: PropTypes.string,
    };

    canGoBack:boolean = false;
    backEventHandle() {
        if (this.canGoBack) {
            this.refs[WEBVIEW_REF].goBack();
        }else {
            this.props.pop();
        }
    }

    renderLeftComponent() {
        return (
            // onPress={props.onNavigateBack}
            <TouchableOpacity style={styles.buttonContainer} onPress={this.backEventHandle.bind(this)}>
                <View style={styles.arrowView}/>
            </TouchableOpacity>
        );
    }

    componentDidMount() {
        this.props.refresh({renderLeftComponent:this.renderLeftComponent.bind(this)});
    }

    _onNavigationStateChange(state:Object){
        // console.log('state:',state);
        if(state.title && state.title.length){
            this.props.refresh({title:state.title});
        }
        this.canGoBack = state.canGoBack;
    }

    _onError(error:Object){
        console.log("webError:",error);
    }
    _onLoadStart(event){
        console.log("onloadStart:", event.nativeEvent);
    }
    _onLoad(){

    }
    _renderError(){
        return (
            // <ExceptionView exceptionType={ExceptionType.NetError} image={noWifi}/>
            <ExceptionView style={{height:screenHeight}} exceptionType={ExceptionType.NetError} />
        );
    }
    _renderLoading(){
        return (
            <ExceptionView style={{height:screenHeight}} exceptionType={ExceptionType.Loading}/>
        );
    }
    // let jsCode = `
    //         document.querySelector('#myContent').style.backgroundColor = 'red';
    //     `;
    //
    //
    /**
     * iOS
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
     _onShouldStartLoadWithRequest(event:Object) {
      //Implement any custom loading logic here, don't forget to return!
      console.log("onShouldStartLoadWithRequest:", event.url);
        if(event.url.startsWith('http://') || event.url.startsWith('https://')) {
            return true;
        }else{
            Linking.canOpenURL(event.url)
                .then(supported => {
                    if(supported){
                        return Linking.openURL(url);
                        // return false;
                    }else{
                        return false;
                    }
                }).catch(err => {
                return false;
            })
        }

      return false;
    }

    render() {
        //  console.log(this.props.scene);
        // console.log(this.props.scene .route.url);
        //  var header = Object.assign({}, httpHeader,{token:userManager.userData.user_token || ""})
        return (
            <View style={[styles.container]}>
                <WebView
                    ref={WEBVIEW_REF}
                    automaticallyAdjustContentInsets={false}
                    style={styles.webView}
                    source={{uri: this.props.scene.route.url}}
                    // javaScriptEnabled={false}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(this)}
                    //javaScriptEnabled={false}
                    onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                    startInLoadingState={true}
                    scalesPageToFit={this.state.scalesPageToFit}
                    onError={this._onError}
                    onLoadStart={this._onLoadStart}
                    onLoad={this._onLoad} //
                    //onMessage={()=>{}}
                    //onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest.bind(this)}//iOS,Android 咱么处理
                    //onLoadEnd
                    //injectedJavaScript=jsCode  //Sets the JS to be injected when the webpage loads.
                    renderLoading={this._renderLoading} //Function that returns a loading indicator.
                    renderError={this._renderError} //Function that returns a view to show if there's an error.
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfb',
    },
    webView: {
        flex:1,
        backgroundColor: '#fbfbfb',
        marginTop:navbarHeight,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width:100,
    },
    button: {
        margin: Platform.OS === 'ios' ? 14 : 16,
        //resizeMode: 'contain'
    },
    arrowView: {
        borderBottomWidth: StyleSheet.hairlineWidth * 2,
        borderRightWidth: StyleSheet.hairlineWidth * 2,
        borderColor: '#8c8c85',
        transform: [{rotate: '135deg'}],
        marginLeft: 15,
        width: 10,
        height: 10,
    },
});


const mapStateToProps = (state) => {
    //从login reduce 中获取state的初始值。
    //console.log('state:',state);
    //去最后一个
    // console.log("web view map state",state.route.navigationState.routes[state.route.navigationState.index]);
    return {
        //  state:state.route.navigationState.routes[state.route.navigationState.index],
        // uri:'',
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        push:(key)=>{
            dispatch(navigatePush(key))
        },
        pop:(state)=>{
            dispatch(navigatePop(state))
        },
        refresh:(route)=>{
            dispatch(navigateRefresh(route))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BaseWebView)
