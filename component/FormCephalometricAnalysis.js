import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  TouchableWithoutFeedback,
  PlatformIOSStatic,
  SafeAreaView,
  PixelRatio,
} from 'react-native';

import ImageZoom from 'react-native-image-pan-zoom';
import ImageViewer from 'react-native-image-pan-zoom/built/image-zoom/image-zoom.component';
import {Appbar, TextInput, CardTitle, Button} from 'react-native-paper';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import ViewShot, {captureRef} from 'react-native-view-shot';
import {launchImageLibrary} from 'react-native-image-picker';
import {generatePDF} from 'react-native-html-to-pdf';
import Svg, {
  Circle,
  Line,
  G,
  Rect,
  SvgXml,
  ClipPath,
  Polyline,
  Polygon,
  Path,
} from 'react-native-svg';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';

import {
  set_markingdot,
  set_resultanalysis,
  set_detailresult,
  set_press_analysis,
  set_press_new_analysis,
  set_press_save_analysis,
  set_reset_scale_image,
  set_disable_pointer,
  set_opacity_pointer,
  set_bantuMarker,
  set_ans,
  set_endPoint,
  set_calibrationDistance,
  set_gnathion,
  set_gonion,
  set_iia,
  set_iii,
  set_isa,
  set_isi,
  set_li,
  set_ls,
  set_menton,
  set_ms,
  set_nasion,
  set_pog,
  set_pogs,
  set_pointa,
  set_pointb,
  set_sella,
  set_startingPoint,
  set_u4,
  set_u6,
  set_sna,
  set_snb,
  set_anb,
  set_pogNB,
  set_snop,
  set_snmp,
  set_uina_angular,
  set_uina_linear,
  set_linb_angular,
  set_linb_linear,
  set__iia,
  set_upper_lip,
  set_lower_lip,
  set_wendellwylie,
  set_patientid,
  set_doctorid,
  set_fullname,
  set_birthdate,
  set_gender,
  set_race,
  set_photo,
  set_tempgambar,
  set_imageuri,
  set_imagetype,
  set_imagefilename,
  set_enablesave,
  remove__iia,
  remove_anb,
  remove_ans,
  remove_endPoint,
  remove_gnathion,
  remove_gonion,
  remove_iia,
  remove_iii,
  remove_isa,
  remove_isi,
  remove_li,
  remove_linb_angular,
  remove_linb_linear,
  remove_lower_lip,
  remove_ls,
  remove_menton,
  remove_ms,
  remove_nasion,
  remove_pog,
  remove_pogNB,
  remove_pogs,
  remove_pointa,
  remove_pointb,
  remove_sella,
  remove_sna,
  remove_snb,
  remove_snmp,
  remove_snop,
  remove_startingPoint,
  remove_u4,
  remove_u6,
  remove_uina_angular,
  remove_uina_linear,
  remove_upper_lip,
  remove_wendellwylie,
  set_headerText,
  set_subHeaderText,
  set_loading,
  set_loading_global,
  set_select_id,
  set_width_last_device,
  set_height_last_device,
} from './actions/variabel';
import {CALIBRATION_DETAILS, MARK_DETAILS} from './common/Constants';
import {generateCephHtml} from './common/Utils';
import {
  _addAnalysisPatient,
  _viewExistingAnalysis,
  _openImage,
  _addAnalysisPatientExistingImage,
  _addPdfReport,
  _addImageAnalysis,
  _predict,
} from './networking/server';
import {
  SNA,
  SNB,
  ANB,
  PogNB,
  SNOP,
  SNMP,
  UPPER_LIP,
  LOWER_LIP,
  UINA_ANGULAR,
  UINA_LINEAR,
  LINB_ANGULAR,
  LINB_LINEAR,
  IIA,
  WendellWylie,
  distanceBetween,
} from './common/Utils';


const key = 'Yzg1MDhmNDYzZjRlMWExOGJkNTk5MmVmNzFkOGQyNzk=';

const spacing = 16;

const dashes = new Array(Math.floor(100 / spacing)).fill(null);

var touch_count = 0;
var point_speed = 0.3;
var marker = [21];
var bantuClick = true;
let isMoving = false;



const {widthScreen, heightScreen} = Dimensions.get('screen');
const {widthScreenAndroid, heightScreenAndroid} = Dimensions.get('window');

let fadeIn = new Animated.Value(Dimensions.get('window').width);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ==== Arsiran (arc) sudut pertemuan garis ====
// Mengubah titik pusat + sudut (derajat) menjadi koordinat x,y pada lingkaran.
function polarToCartesianDeg(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

// Membuat path SVG busur (arc) dari startAngle sejauh sweepAngle (derajat),
// searah dengan konvensi atan2 yang dipakai fungsi-fungsi sudut di Utils.js.
function describeArcPathDeg(cx, cy, r, startAngleDeg, sweepAngleDeg) {
  const sweep = Number(sweepAngleDeg) || 0;
  const endAngleDeg = Number(startAngleDeg) + sweep;
  const start = polarToCartesianDeg(cx, cy, r, Number(startAngleDeg));
  const end = polarToCartesianDeg(cx, cy, r, endAngleDeg);
  const largeArcFlag = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

// Komponen arsiran sudut: menggambar busur kecil pada titik pertemuan (vertex)
// dua garis analisis, memakai data {x, y, startAngle, sweepAngle} yang sudah
// dihasilkan oleh fungsi SNA/SNB/ANB/SNOP/SNMP/UINA_ANGULAR/LINB_ANGULAR/IIA
// di common/Utils.js.
function AngleArc({angle, radius, color = 'yellow', strokeWidth = 0.8}) {
  if (!angle || angle.x == null || angle.y == null) return null;
  const r = radius || wp(3.5);
  return (
    <Path
      d={describeArcPathDeg(angle.x, angle.y, r, angle.startAngle, angle.sweepAngle)}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
  );
}

const FormCephalometricAnalysis = ({navigation,route}) => {

      const bantuMarker = useSelector((state) => state.variabelReducer.bantuMarker);
      const pressSaveAnalysis = useSelector((state) => state.variabelReducer.pressSaveAnalysis);
      const pressAnalysis = useSelector((state) => state.variabelReducer.pressAnalysis);
      const pressNewAnalysis = useSelector((state) => state.variabelReducer.pressNewAnalysis);
      const resetScaleImage = useSelector((state) => state.variabelReducer.resetScaleImage);
      const headerText = useSelector((state) => state.variabelReducer.headerText);
      const subHeaderText = useSelector((state) => state.variabelReducer.subHeaderText);
      const loadingGlobal = useSelector((state) => state.variabelReducer.loadingGlobal);
      const loading = useSelector((state) => state.variabelReducer.loading);
      const disablePointer = useSelector((state) => state.variabelReducer.disablePointer);
      const opacityPointer = useSelector((state) => state.variabelReducer.opacityPointer);
      const startingPoint = useSelector((state) => state.variabelReducer.startingPoint);
      const endPoint = useSelector((state) => state.variabelReducer.endPoint);
      const calibrationDistance = useSelector((state) => state.variabelReducer.calibrationDistance);
      const sella = useSelector((state) => state.variabelReducer.sella);
      const nasion = useSelector((state) => state.variabelReducer.nasion);
      const pointa = useSelector((state) => state.variabelReducer.pointa);
      const pointb = useSelector((state) => state.variabelReducer.pointb);
      const u6 = useSelector((state) => state.variabelReducer.u6);
      const u4 = useSelector((state) => state.variabelReducer.u4);
      const gonion = useSelector((state) => state.variabelReducer.gonion);
      const gnathion = useSelector((state) => state.variabelReducer.gnathion);
      const isa = useSelector((state) => state.variabelReducer.isa);
      const isi = useSelector((state) => state.variabelReducer.isi);
      const iia = useSelector((state) => state.variabelReducer.iia);
      const iii = useSelector((state) => state.variabelReducer.iii);
      const ms = useSelector((state) => state.variabelReducer.ms);
      const pogs = useSelector((state) => state.variabelReducer.pogs);
      const ls = useSelector((state) => state.variabelReducer.ls);
      const li = useSelector((state) => state.variabelReducer.li);
      const pog = useSelector((state) => state.variabelReducer.pog);
      const ans = useSelector((state) => state.variabelReducer.ans);
      const menton = useSelector((state) => state.variabelReducer.menton);
      const markingDot = useSelector((state) => state.variabelReducer.markingDot);
      const resultAnalysis = useSelector((state) => state.variabelReducer.resultAnalysis);
      const detailResult = useSelector((state) => state.variabelReducer.detailResult);
      const selectid = useSelector((state) => state.variabelReducer.selectid);
      const widthLastDevice = useSelector((state) => state.variabelReducer.widthLastDevice);
      const heightLastDevice = useSelector((state) => state.variabelReducer.heightLastDevice);

      const sna = useSelector((state) => state.resultReducer.sna);
      const snb = useSelector((state) => state.resultReducer.snb);
      const anb = useSelector((state) => state.resultReducer.anb);
      const pogNB = useSelector((state) => state.resultReducer.pogNB);
      const snop = useSelector((state) => state.resultReducer.snop);
      const snmp = useSelector((state) => state.resultReducer.snmp);
      const uina_angular = useSelector((state) => state.resultReducer.uina_angular);
      const uina_linear = useSelector((state) => state.resultReducer.uina_linear);
      const linb_angular = useSelector((state) => state.resultReducer.linb_angular);
      const linb_linear = useSelector((state) => state.resultReducer.linb_linear);
      const _iia = useSelector((state) => state.resultReducer._iia);
      const upper_lip = useSelector((state) => state.resultReducer.upper_lip);
      const lower_lip = useSelector((state) => state.resultReducer.lower_lip);
      const mid_face = useSelector((state) => state.resultReducer.mid_face);
      const lower_face = useSelector((state) => state.resultReducer.lower_face);
      const wendellWylie = useSelector((state) => state.resultReducer.wendellWylie);
      const patientid = useSelector((state) => state.patientReducer.patientid);
      const doctorid = useSelector((state) => state.patientReducer.doctorid);
      const fullname = useSelector((state) => state.patientReducer.fullname);
      const gender = useSelector((state) => state.patientReducer.gender);
      const birthdate = useSelector((state) => state.patientReducer.birthdate);
      const race = useSelector((state) => state.patientReducer.race);
      const photo = useSelector((state) => state.patientReducer.photo);
      const ageInYears = useSelector((state) => state.patientReducer.ageInYears);
      const step = useSelector((state) => state.patientReducer.step);
      const tempGambar = useSelector((state) => state.patientReducer.tempGambar);
      const imageUri = useSelector((state) => state.patientReducer.imageUri);
      const imageType = useSelector((state) => state.patientReducer.imageType);
      const imageFileName = useSelector((state) => state.patientReducer.imageFileName);
      const enableSave = useSelector((state) => state.patientReducer.enableSave);
   
    
     
  
    const dispatch = useDispatch();
    const set_press_analysis_handler = (val) => dispatch(set_press_analysis(val));
    const set_press_new_analysis_handler = (val) => dispatch(set_press_new_analysis(val));
    const set_press_save_analysis_handler = (val) => dispatch(set_press_save_analysis(val));
    const set_reset_scale_image_handler = (val) => dispatch(set_reset_scale_image(val));
    const set_disable_pointer_handler = (val) => dispatch(set_disable_pointer(val));
    const set_opacity_pointer_handler = (val) => dispatch(set_opacity_pointer(val));
    const set_bantuMarker_handler = (val) => dispatch(set_bantuMarker(val));
    const set_markingdot_handler = (val) => dispatch(set_markingdot(val));
    const set_resultanalysis_handler = (val) => dispatch(set_resultanalysis(val));
    const set_detailresult_handler = (val) => dispatch(set_detailresult(val));
    const set_startingPoint_handler = (val) => dispatch(set_startingPoint(val));
    const set_endPoint_handler = (val) => dispatch(set_endPoint(val));
    const set_calibrationDistance_handler = (val) => dispatch(set_calibrationDistance(val));
    const set_sella_handler = (val) => dispatch(set_sella(val));
    const set_nasion_handler = (val) => dispatch(set_nasion(val));
    const set_pointa_handler = (val) => dispatch(set_pointa(val));
    const set_pointb_handler = (val) => dispatch(set_pointb(val));
    const set_u6_handler = (val) => dispatch(set_u6(val));
    const set_u4_handler = (val) => dispatch(set_u4(val));
    const set_gonion_handler = (val) => dispatch(set_gonion(val));
    const set_gnathion_handler = (val) => dispatch(set_gnathion(val));
    const set_isa_handler = (val) => dispatch(set_isa(val));
    const set_isi_handler = (val) => dispatch(set_isi(val));
    const set_iia_handler = (val) => dispatch(set_iia(val));
    const set_iii_handler = (val) => dispatch(set_iii(val));
    const set_ms_handler = (val) => dispatch(set_ms(val));
    const set_pogs_handler = (val) => dispatch(set_pogs(val));
    const set_ls_handler = (val) => dispatch(set_ls(val));
    const set_li_handler = (val) => dispatch(set_li(val));
    const set_pog_handler = (val) => dispatch(set_pog(val));
    const set_ans_handler = (val) => dispatch(set_ans(val));
    const set_menton_handler = (val) => dispatch(set_menton(val));
    const set_sna_handler = (val) => dispatch(set_sna(val));
    const set_snb_handler = (val) => dispatch(set_snb(val));
    const set_anb_handler = (val) => dispatch(set_anb(val));
    const set_pogNB_handler = (val) => dispatch(set_pogNB(val));
    const set_snop_handler = (val) => dispatch(set_snop(val));
    const set_snmp_handler = (val) => dispatch(set_snmp(val));
    const set_uina_angular_handler = (val) => dispatch(set_uina_angular(val));
    const set_uina_linear_handler = (val) => dispatch(set_uina_linear(val));
    const set_linb_angular_handler = (val) => dispatch(set_linb_angular(val));
    const set_linb_linear_handler = (val) => dispatch(set_linb_linear(val));
    const set__iia_handler = (val) => dispatch(set__iia(val));
    const set_upper_lip_handler = (val) => dispatch(set_upper_lip(val));
    const set_lower_lip_handler = (val) => dispatch(set_lower_lip(val));
    const set_wendellwylie_handler = (val) => dispatch(set_wendellwylie(val));
    const set_patientid_handler = (val) => dispatch(set_patientid(val));
    const set_doctorid_handler = (val) => dispatch(set_doctorid(val));
    const set_fullname_handler = (val) => dispatch(set_fullname(val));
    const set_gender_handler = (val) => dispatch(set_gender(val));
    const set_birthdate_handler = (val) => dispatch(set_birthdate(val));
    const set_race_handler = (val) => dispatch(set_race(val));
    const set_photo_handler = (val) => dispatch(set_photo(val));
    const set_tempgambar_handler = (val) => dispatch(set_tempgambar(val));
    const set_imageuri_handler = (val) => dispatch(set_imageuri(val));
    const set_imagetype_handler = (val) => dispatch(set_imagetype(val));
    const set_imagefilename_handler = (val) => dispatch(set_imagefilename(val));
    const set_enablesave_handler = (val) => dispatch(set_enablesave(val));
    const remove_startingPoint_handler = (val) => dispatch(remove_startingPoint(val));
    const remove_endPoint_handler = (val) => dispatch(remove_endPoint(val));
    const remove_sella_handler = (val) => dispatch(remove_sella(val));
    const remove_nasion_handler = (val) => dispatch(remove_nasion(val));
    const remove_pointa_handler = (val) => dispatch(remove_pointa(val));
    const remove_pointb_handler = (val) => dispatch(remove_pointb(val));
    const remove_u6_handler = (val) => dispatch(remove_u6(val));
    const remove_u4_handler = (val) => dispatch(remove_u4(val));
    const remove_gonion_handler = (val) => dispatch(remove_gonion(val));
    const remove_gnathion_handler = (val) => dispatch(remove_gnathion(val));
    const remove_isa_handler = (val) => dispatch(remove_isa(val));
    const remove_isi_handler = (val) => dispatch(remove_isi(val));
    const remove_iia_handler = (val) => dispatch(remove_iia(val));
    const remove_iii_handler = (val) => dispatch(remove_iii(val));
    const remove_ms_handler = (val) => dispatch(remove_ms(val));
    const remove_pogs_handler = (val) => dispatch(remove_pogs(val));
    const remove_ls_handler = (val) => dispatch(remove_ls(val));
    const remove_li_handler = (val) => dispatch(remove_li(val));
    const remove_pog_handler = (val) => dispatch(remove_pog(val));
    const remove_ans_handler = (val) => dispatch(remove_ans(val));
    const remove_menton_handler = (val) => dispatch(remove_menton(val));
    const remove_sna_handler = (val) => dispatch(remove_sna(val));
    const remove_snb_handler = (val) => dispatch(remove_snb(val));
    const remove_anb_handler = (val) => dispatch(remove_anb(val));
    const remove_pogNB_handler = (val) => dispatch(remove_pogNB(val));
    const remove_snop_handler = (val) => dispatch(remove_snop(val));
    const remove_snmp_handler = (val) => dispatch(remove_snmp(val));
    const remove_uina_angular_handler = (val) => dispatch(remove_uina_angular(val));
    const remove_uina_linear_handler = (val) => dispatch(remove_uina_linear(val));
    const remove_linb_angular_handler = (val) => dispatch(remove_linb_angular(val));
    const remove_linb_linear_handler = (val) => dispatch(remove_linb_linear(val));
    const remove__iia_handler = (val) => dispatch(remove__iia(val));
    const remove_upper_lip_handler = (val) => dispatch(remove_upper_lip(val));
    const remove_lower_lip_handler = (val) => dispatch(remove_lower_lip(val));
    const remove_wendellwylie_handler = (val) => dispatch(remove_wendellwylie(val));
    const set_headerText_handler = (val) => dispatch(set_headerText(val));
    const set_subHeaderText_handler = (val) => dispatch(set_subHeaderText(val));
    const set_loading_handler = (val) => dispatch(set_loading(val));
    const set_loading_global_handler = (val) => dispatch(set_loading_global(val));
    const set_select_id_handler = (val) => dispatch(set_select_id(val));
    const set_width_last_device_handler = (val) => dispatch(set_width_last_device(val));
    const set_height_last_device_handler = (val) => dispatch(set_height_last_device(val));
    

  const ref_capture = useRef();
  const refImageZoom = useRef();
  const click_imageZoom = useRef(null);

  // const [marker, setMarker] = useState([21]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModal, setImageModal] = useState(null);
  const [textModal, setTextModal] = useState('');
  const [titleText, setTitleText] = useState('');
  // const [_headerText, set_headerText] = useState('');
  const [pinchToZoom, setPinchToZoom] = useState(false);
  const [scaleScreen, setScaleScreen] = useState(null);
  const [correctionPoint, setcorrectionPoint] = useState(null);

  const [widthImage, setWidthImage] = useState(null);
  const [heightImage, setHeightImage] = useState(null);

  const fadeAnim = useRef(new Animated.Value(3)).current;
  const strokeBorderAnim = useRef(new Animated.Value(0.8)).current;

  const layoutWidth = PixelRatio.getPixelSizeForLayoutSize(
    widthLastDevice,
  );
  const layoutHeight = PixelRatio.getPixelSizeForLayoutSize(
    heightLastDevice,
  );

  //BACK HANDLER
  useEffect(() => {
    
    const backAction = () => {
      Alert.alert(
        'Do you want to save before exiting?',
        'Unsaved work will be lost.',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'DONT SAVE',
            onPress: () => {
              backHandler.remove();
              navigation.goBack();
            },
            style: 'cancel',
          },
          {text: 'SAVE', onPress: () => set_press_save_analysis_handler(true)},
        ],
      );
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    
    setTitleText('');
    set_bantuMarker_handler(0);

    clearVaribleGlobal();
    set_enablesave_handler(false);
    
    return () => {
      
      set_loading_handler(true);
      set_bantuMarker_handler(0);
      set_markingdot_handler(true);
      set_resultanalysis_handler(false);
      set_detailresult_handler(false);

      set_tempgambar_handler(null);
      set_imageuri_handler(null);
      set_imagetype_handler(null);
      set_imagefilename_handler(null);

      remove_startingPoint_handler([]);
      remove_endPoint_handler([]);
      set_calibrationDistance_handler(null);
      remove_sella_handler([]);
      remove_nasion_handler([]);
      remove_pointa_handler([]);
      remove_pointb_handler([]);
      remove_u6_handler([]);
      remove_u4_handler([]);
      remove_gonion_handler([]);
      remove_gnathion_handler([]);
      remove_isa_handler([]);
      remove_isi_handler([]);
      remove_iia_handler([]);
      remove_iii_handler([]);
      remove_ms_handler([]);
      remove_pogs_handler([]);
      remove_li_handler([]);
      remove_ls_handler([]);
      remove_pog_handler([]);
      remove_ans_handler([]);
      remove_menton_handler([]);

      remove_sna_handler([]);
      remove_snb_handler([]);
      remove_anb_handler([]);
      remove_pogNB_handler([]);
      remove_snop_handler([]);
      remove_snmp_handler([]);
      remove_uina_angular_handler([]);
      remove_uina_linear_handler([]);
      remove_linb_angular_handler([]);
      remove_linb_linear_handler([]);
      remove__iia_handler([]);
      remove_upper_lip_handler([]);
      remove_lower_lip_handler([]);
      remove_wendellwylie_handler([]);
      set_headerText_handler('Cephalometric Analysis');
      set_subHeaderText_handler('');
    };
  }, []);

  useEffect(() => {
    
    console.log('FormCephalometric analysis bantumarker : ' + bantuMarker);
    if (bantuMarker > 0 && tempGambar && bantuMarker < 23) {
      set_disable_pointer_handler('auto');
      set_opacity_pointer_handler(1);

      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).reset();
      console.log('###masuk edit point###' + bantuMarker);
    } else if (bantuMarker === 23) {
      navigation.openDrawer();

      // set_resultanalysis_handler(false);
      // set_detailresult_handler(false);
    } else if (bantuMarker === 24) {
      // Mode edit hasil AI tetap mengizinkan tombol navigasi landmark.
      set_disable_pointer_handler('auto');
      set_opacity_pointer_handler(0.5);
      set_enablesave_handler(false);
      set_detailresult_handler(false);
      _analysis();
    }

    setTitle();

    console.log('tempGambar' + JSON.stringify(tempGambar));
    if (bantuMarker == 0 && tempGambar !== null) {
      set_bantuMarker_handler(1);
    }

    if (
      bantuMarker == 0 &&
      headerText === 'Starting Point of Calibration'
    ) {
      set_bantuMarker_handler(1);
    }
  }, [bantuMarker]);


  //  function isAllMarkerFilled() {
  //   const requiredPoints = [
  //     startingPoint,
  //     endPoint,
  //     sella,
  //     nasion,
  //     pointa,
  //     pointb,
  //     u6,
  //     u4,
  //     gonion,
  //     gnathion,
  //     isa,
  //     isi,
  //     iia,
  //     iii,
  //     ms,
  //     pogs,
  //     ls,
  //     li,
  //     pog,
  //     ans,
  //     menton,
  //   ];

  //   const allPointsFilled = requiredPoints.every(
  //     (point) =>
  //       Array.isArray(point) &&
  //       point.length > 0 &&
  //       point[0] != null &&
  //       point[0].x != null &&
  //       point[0].y != null,
  //   );

  //   const calibrationFilled =
  //     calibrationDistance !== null &&
  //     calibrationDistance !== undefined &&
  //     calibrationDistance !== '';

  //   return allPointsFilled && calibrationFilled;
  // }

  // useEffect(() => {
  //   if (isAllMarkerFilled()) {
  //     console.log('### Semua marker sudah terisi, update title ke Cephalometric ' + step);
  //     navigation.openDrawer();
  //     set_headerText_handler('Cephalometric ' + step);
  //     set_subHeaderText_handler('');
  //   }
  // }, [
  //   startingPoint,
  //   endPoint,
  //   calibrationDistance,
  //   sella,
  //   nasion,
  //   pointa,
  //   pointb,
  //   u6,
  //   u4,
  //   gonion,
  //   gnathion,
  //   isa,
  //   isi,
  //   iia,
  //   iii,
  //   ms,
  //   pogs,
  //   ls,
  //   li,
  //   pog,
  //   ans,
  //   menton,
  //   step,
  // ]);
  
  //existing load all data after loading
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1.3,
      duration: 100,
      useNativeDriver: true,
    }).start();
    Animated.timing(strokeBorderAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    if (bantuMarker == 23 && loading == false) {
    }
  }, [loading]);

  useEffect(() => {

     
    if (pinchToZoom == false) {
      click_imageZoom.current?.touch;
      // setPinchToZoom(true);
    }

    return () => {
      if (pinchToZoom == true) {
        setPinchToZoom(false);
      }
    };
  }, [pinchToZoom]);

  useLayoutEffect(() => {
    return () => {
      set_bantuMarker_handler(0);
      set_markingdot_handler(true);
      set_press_analysis_handler(false);
      set_press_new_analysis_handler(false);
      set_resultanalysis_handler(false);
      set_detailresult_handler(false);
      set_enablesave_handler(true);
      set_tempgambar_handler(null);
      set_imageuri_handler(null);
      set_imagetype_handler(null);
      set_imagefilename_handler(null);

      remove_startingPoint_handler([]);
      remove_endPoint_handler([]);
      set_calibrationDistance_handler(null);
      remove_sella_handler([]);
      remove_nasion_handler([]);
      remove_pointa_handler([]);
      remove_pointb_handler([]);
      remove_u6_handler([]);
      remove_u4_handler([]);
      remove_gonion_handler([]);
      remove_gnathion_handler([]);
      remove_isa_handler([]);
      remove_isi_handler([]);
      remove_iia_handler([]);
      remove_iii_handler([]);
      remove_ms_handler([]);
      remove_pogs_handler([]);
      remove_li_handler([]);
      remove_ls_handler([]);
      remove_pog_handler([]);
      remove_ans_handler([]);
      remove_menton_handler([]);

      remove_sna_handler([]);
      remove_snb_handler([]);
      remove_anb_handler([]);
      remove_pogNB_handler([]);
      remove_snop_handler([]);
      remove_snmp_handler([]);
      remove_uina_angular_handler([]);
      remove_uina_linear_handler([]);
      remove_linb_angular_handler([]);
      remove_linb_linear_handler([]);
      remove__iia_handler([]);
      remove_upper_lip_handler([]);
      remove_lower_lip_handler([]);
      remove_wendellwylie_handler([]);
      set_headerText_handler('Cephalometric Analysis');
      set_subHeaderText_handler('');
      set_detailresult_handler(false);
      set_select_id_handler(null);
    };
  }, []);

  const clearVaribleGlobal = () => {
    set_loading_handler(true);

    checkData();
  };

  useEffect(() => {
    if (widthLastDevice && heightLastDevice) {
      if(pressNewAnalysis == false){
        console.log('width Last : ' + widthLastDevice);
        console.log('height Last : ' + heightLastDevice);
        load_point();
     
      }
     
    }
  }, [widthLastDevice, heightLastDevice]);

  const checkData = async () => {
    marker = [];

    var data = {
      patientid: patientid,
      step: step,
    };

    await _viewExistingAnalysis(data)
      .then((result) => {
        
        console.log("load existing data ="+JSON.stringify(result));
        if (result[0].jumlah > 0) {
          set_width_last_device_handler(result[0].width);
          set_height_last_device_handler(result[0].height);

          let gambarnya = _openImage(result[0].images);

          console.log('Load Image ' + result[0].images);
          console.log('Width Screen : ' + Dimensions.get('screen').width);
          console.log('Width Height : ' + Dimensions.get('screen').height);
          let source = {uri: gambarnya};

          if (source) {
            console.log('load Source Image');
            set_tempgambar_handler(source);
            // set_bantuMarker_handler(24);
            setTitleText('Load Image');
          }
        } else {
          set_bantuMarker_handler(0);
          marker = [];
          set_loading_handler(false);
          return false;
        }
      })
      .catch((error) => {
        console.log(error);
        // ToastAndroid.show('LOG Error : ' + error, ToastAndroid.SHORT);
      });
  };

  const load_point = () => {
    var data = {
      patientid: patientid,
      step: step,
    };

    _viewExistingAnalysis(data)
      .then((result) => {
        if (result[0].jumlah > 0) {
          console.log('masuk _viewExistingAnalysis datanya ='+JSON.stringify(result));
          set_startingPoint_handler(JSON.parse(result[0].startingPoint));

          set_endPoint_handler(JSON.parse(result[0].endPoint));
          set_calibrationDistance_handler(
            '' + result[0].calibrationDistance + '',
          );
          set_sella_handler(JSON.parse(result[0].sella));
          set_nasion_handler(JSON.parse(result[0].nasion));
          set_pointa_handler(JSON.parse(result[0].pointA));
          set_pointb_handler(JSON.parse(result[0].pointB));
          set_u6_handler(JSON.parse(result[0].u6));
          set_u4_handler(JSON.parse(result[0].u4));
          set_gonion_handler(JSON.parse(result[0].gonion));
          set_gnathion_handler(JSON.parse(result[0].gnathion));
          set_isa_handler(JSON.parse(result[0].isa));
          set_isi_handler(JSON.parse(result[0].isi));
          set_iia_handler(JSON.parse(result[0].iia));
          set_iii_handler(JSON.parse(result[0].iii));
          set_ms_handler(JSON.parse(result[0].ms));
          set_pogs_handler(JSON.parse(result[0].pogs));
          set_li_handler(JSON.parse(result[0].li));
          set_ls_handler(JSON.parse(result[0].ls));
          set_pog_handler(JSON.parse(result[0].pog));
          set_ans_handler(JSON.parse(result[0].ans));
          set_menton_handler(JSON.parse(result[0].menton));

          loadExistingMarker(JSON.parse(result[0].startingPoint));
          loadExistingMarker(JSON.parse(result[0].endPoint));
          loadExistingMarker(JSON.parse(result[0].sella));
          loadExistingMarker(JSON.parse(result[0].nasion));
          loadExistingMarker(JSON.parse(result[0].pointA));
          loadExistingMarker(JSON.parse(result[0].pointB));
          loadExistingMarker(JSON.parse(result[0].u6));
          loadExistingMarker(JSON.parse(result[0].u4));
          loadExistingMarker(JSON.parse(result[0].gonion));
          loadExistingMarker(JSON.parse(result[0].gnathion));
          loadExistingMarker(JSON.parse(result[0].isa));
          loadExistingMarker(JSON.parse(result[0].isi));
          loadExistingMarker(JSON.parse(result[0].iia));
          loadExistingMarker(JSON.parse(result[0].iii));
          loadExistingMarker(JSON.parse(result[0].ms));
          loadExistingMarker(JSON.parse(result[0].pogs));
          loadExistingMarker(JSON.parse(result[0].li));
          loadExistingMarker(JSON.parse(result[0].ls));
          loadExistingMarker(JSON.parse(result[0].pog));
          loadExistingMarker(JSON.parse(result[0].ans));
          loadExistingMarker(JSON.parse(result[0].menton));
          set_bantuMarker_handler(24);
        } else {
          set_bantuMarker_handler(0);
          marker = [];
          set_loading_handler(false);
          return false;
        }
      })
      .catch((error) => {
        console.log(error);
        // ToastAndroid.show('LOG Error : ' + error, ToastAndroid.SHORT);
      });
  };

 

  function loadExistingMarker(point) {
    if (point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y))) {
      let newMarker = {
        x: point.x,
        y: point.y,
      };

      marker.push(newMarker);
      // setMarker((prevState) => [...prevState, newMarker]);
    }
  }

  // Index landmark yang sedang dipilih saat mode edit hasil AI (bantuMarker === 24)
  let selectedMarkerIndex = 0;

  function _clickImage(
    event = null,
    up = false,
    down = false,
    left = false,
    right = false,
  ) {
    try {
      // Mode edit hasil AI: tap landmark untuk memilihnya, lalu gunakan
      // tombol Up/Down/Left/Right untuk menggeser landmark tersebut.
      if (bantuMarker === 24) {
        if (event && marker && marker.length > 0) {
          const touchX = Number(event.locationX);
          const touchY = Number(event.locationY);
          let nearestIndex = -1;
          let nearestDistance = Infinity;

          marker.forEach((value, index) => {
            if (
              value &&
              Number.isFinite(Number(value.x)) &&
              Number.isFinite(Number(value.y))
            ) {
              const dx = Number(value.x) - touchX;
              const dy = Number(value.y) - touchY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
              }
            }
          });

          // Hanya pilih marker yang cukup dekat dengan sentuhan.
          if (nearestIndex >= 0 && nearestDistance <= 35) {
            selectedMarkerIndex = nearestIndex;
            console.log('Selected landmark index:', selectedMarkerIndex);
          }
        }

        // Jika tidak ada arah, event hanya digunakan untuk memilih marker.
        if (!up && !down && !left && !right) {
          return;
        }

        const current = marker?.[selectedMarkerIndex];
        if (
          !current ||
          !Number.isFinite(Number(current.x)) ||
          !Number.isFinite(Number(current.y))
        ) {
          console.warn(
            'Navigation ignored: selected landmark coordinate is null/invalid',
            selectedMarkerIndex,
            current,
          );
          return;
        }

        const dx = right ? point_speed : left ? -point_speed : 0;
        const dy = down ? point_speed : up ? -point_speed : 0;

        const newMarker = {
          x: Number(current.x) + dx,
          y: Number(current.y) + dy,
          edit: true,
        };

        marker[selectedMarkerIndex] = newMarker;
        updateMarkerState(selectedMarkerIndex, newMarker);
        return;
      }

      let newMarker = null;

      // Klik gambar pada mode marking biasa.
      if (event) {
        const x = Number(event.locationX);
        const y = Number(event.locationY);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          console.warn('Invalid touch coordinate:', event);
          return;
        }
        newMarker = {x, y, edit: true};
      }

      // Mapping index marker -> state/setter.
      const states = {
        1: startingPoint,
        2: endPoint,
        4: sella,
        5: nasion,
        6: pointa,
        7: pointb,
        8: u6,
        9: u4,
        10: gonion,
        11: gnathion,
        12: isa,
        13: isi,
        14: iia,
        15: iii,
        16: ms,
        17: pogs,
        18: ls,
        19: li,
        20: pog,
        21: ans,
        22: menton,
      };

      const setters = {
        1: set_startingPoint_handler,
        2: set_endPoint_handler,
        4: set_sella_handler,
        5: set_nasion_handler,
        6: set_pointa_handler,
        7: set_pointb_handler,
        8: set_u6_handler,
        9: set_u4_handler,
        10: set_gonion_handler,
        11: set_gnathion_handler,
        12: set_isa_handler,
        13: set_isi_handler,
        14: set_iia_handler,
        15: set_iii_handler,
        16: set_ms_handler,
        17: set_pogs_handler,
        18: set_ls_handler,
        19: set_li_handler,
        20: set_pog_handler,
        21: set_ans_handler,
        22: set_menton_handler,
      };

      const markerIndex = bantuMarker === 3 ? null : bantuMarker;
      const currentState = markerIndex ? states[markerIndex] : null;
      const setter = markerIndex ? setters[markerIndex] : null;

      // Klik untuk membuat/mengganti titik.
      if (event && markerIndex && setter) {
        marker[markerIndex - 1] = newMarker;
        setter(newMarker);
        return;
      }

      // Tidak ada koordinat aktif -> jangan pernah akses [0].x / [0].y.
      if (!setter || !currentState || !currentState[0]) {
        console.warn(
          'Navigation ignored: landmark coordinate is null/empty',
          bantuMarker,
          currentState,
        );
        return;
      }

      const current = currentState[0];
      const x = Number(current.x);
      const y = Number(current.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        console.warn('Navigation ignored: invalid landmark coordinate', current);
        return;
      }

      const dx = right ? point_speed : left ? -point_speed : 0;
      const dy = down ? point_speed : up ? -point_speed : 0;
      if (dx === 0 && dy === 0) return;

      newMarker = {
        x: x + dx,
        y: y + dy,
        edit: true,
      };

      marker[markerIndex - 1] = newMarker;
      setter(newMarker);
    } catch (error) {
      // Jangan biarkan error koordinat membuat React Native menutup aplikasi.
      console.error('Navigation landmark error:', error);
    }
  }

  // Update state landmark berdasarkan index marker (0-based).
  function updateMarkerState(index, value) {
    const setters = [
      set_startingPoint_handler,
      set_endPoint_handler,
      null, // calibration distance bukan landmark
      set_sella_handler,
      set_nasion_handler,
      set_pointa_handler,
      set_pointb_handler,
      set_u6_handler,
      set_u4_handler,
      set_gonion_handler,
      set_gnathion_handler,
      set_isa_handler,
      set_isi_handler,
      set_iia_handler,
      set_iii_handler,
      set_ms_handler,
      set_pogs_handler,
      set_ls_handler,
      set_li_handler,
      set_pog_handler,
      set_ans_handler,
      set_menton_handler,
    ];

    const setter = setters[index];
    if (typeof setter === 'function') {
      setter(value);
    } else {
      console.warn('No setter for landmark index:', index);
    }
  }

  function _prevClick() {
    if (bantuMarker > 4 && bantuMarker <= 22) {
      set_bantuMarker_handler(bantuMarker - 1);
    }

    if (bantuMarker > 1 && bantuMarker <= 3) {
      set_bantuMarker_handler(bantuMarker - 1);
    }
  }
  function _nextClick() {
    if (bantuMarker >= 1 && bantuMarker <= 2) {
      set_bantuMarker_handler(bantuMarker + 1);
      set_disable_pointer_handler('auto');
      set_opacity_pointer_handler(1);
    }

    if (bantuMarker > 3 && bantuMarker <= 22) {
      set_bantuMarker_handler(bantuMarker + 1);
      set_disable_pointer_handler('auto');
      set_opacity_pointer_handler(1);
    }

    if (bantuMarker == 3) {
      navigation.openDrawer();
      set_bantuMarker_handler(25);
      set_disable_pointer_handler('none');
      set_opacity_pointer_handler(0.5);
    }
  }
  function _upClick() {
    _clickImage(null, true, false, false, false, false);
  }
  function _downClick() {
    _clickImage(null, false, true, false, false);
  }
  function _leftClick() {
    _clickImage(null, false, false, true, false);
  }
  function _rightClick() {
    _clickImage(null, false, false, false, true);
  }

  // =============================
  // SET Title
  // =============================

  function setTitle() {
    if (bantuMarker == 0) {
      set_headerText_handler('Cephalometric Analysis');
      set_subHeaderText_handler('');
    }

    if (bantuMarker == 1) {
      setTitleText(CALIBRATION_DETAILS[0].HELP[0].INFO);
      set_headerText_handler(CALIBRATION_DETAILS[0].NAME);
      set_subHeaderText_handler('');
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  End Point
    if (bantuMarker == 2) {
      setTitleText(CALIBRATION_DETAILS[1].HELP[0].INFO);
      set_headerText_handler(CALIBRATION_DETAILS[1].NAME);
      set_subHeaderText_handler('');
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    //  Calibration Distance
    if (bantuMarker == 3) {
      setTitleText(CALIBRATION_DETAILS[2].HELP[0].INFO);
      // set_headerText_handler(CALIBRATION_DETAILS[2].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    //  Sella
    if (bantuMarker == 4) {
      setTitleText(MARK_DETAILS[0].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[0].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[0].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  Nasion
    if (bantuMarker == 5) {
      setTitleText(MARK_DETAILS[1].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[1].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[1].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  POINTA
    if (bantuMarker == 6) {
      setTitleText(MARK_DETAILS[2].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[2].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[2].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  POINTB
    if (bantuMarker == 7) {
      setTitleText(MARK_DETAILS[3].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[3].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[3].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  U6
    if (bantuMarker == 8) {
      setTitleText(MARK_DETAILS[4].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[4].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[4].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  U4
    if (bantuMarker == 9) {
      setTitleText(MARK_DETAILS[5].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[5].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[5].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  GONION
    if (bantuMarker == 10) {
      setTitleText(MARK_DETAILS[6].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[6].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[6].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  GNATHION
    if (bantuMarker == 11) {
      setTitleText(MARK_DETAILS[7].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[7].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[7].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  ISA
    if (bantuMarker == 12) {
      setTitleText(MARK_DETAILS[8].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[8].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[8].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  ISI
    if (bantuMarker == 13) {
      setTitleText(MARK_DETAILS[9].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[9].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[9].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  IIA
    if (bantuMarker == 14) {
      setTitleText(MARK_DETAILS[10].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[10].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[10].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  III
    if (bantuMarker == 15) {
      setTitleText(MARK_DETAILS[11].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[11].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[11].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  MS
    if (bantuMarker == 16) {
      setTitleText(MARK_DETAILS[12].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[12].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[12].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  POGS
    if (bantuMarker == 17) {
      setTitleText(MARK_DETAILS[13].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[13].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[13].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  LS
    if (bantuMarker == 18) {
      setTitleText(MARK_DETAILS[14].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[14].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[14].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  LI
    if (bantuMarker == 19) {
      setTitleText(MARK_DETAILS[15].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[15].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[15].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  POG
    if (bantuMarker == 20) {
      setTitleText(MARK_DETAILS[16].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[16].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[16].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  ANS
    if (bantuMarker == 21) {
      console.log('masuk 21');
      setTitleText(MARK_DETAILS[17].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[17].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[17].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    //  MENTON
    if (bantuMarker == 22) {
      console.log('masuk 22');
      setTitleText(MARK_DETAILS[18].HELP[0].INFO);
      set_headerText_handler(MARK_DETAILS[18].INITIAL);
      set_subHeaderText_handler(MARK_DETAILS[18].NAME);
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    if (bantuMarker == 23) {
      set_headerText_handler('Cephalometric ' + step);
      set_subHeaderText_handler('');
      setTitleText('-');
    }

    if (bantuMarker == 24) {
      set_headerText_handler('Cephalometric ' + step);
      set_subHeaderText_handler('');
    }
  }

  // ==================================
  // ===Help Button Header
  // ======================

  function helpPopUp(val) {
    setModalVisible(true);
    if (val == 1) {
      setImageModal(CALIBRATION_DETAILS[0].HELP[0].IMG);
      setTextModal(CALIBRATION_DETAILS[0].HELP[0].DESC);
    }

    if (val == 2) {
      setImageModal(CALIBRATION_DETAILS[1].HELP[0].IMG);
      setTextModal(CALIBRATION_DETAILS[1].HELP[0].DESC);
    }
    if (val == 3) {
      setImageModal(CALIBRATION_DETAILS[2].HELP[0].IMG);
      setTextModal(CALIBRATION_DETAILS[2].HELP[0].DESC);
    }

    if (val == 4) {
      setImageModal(MARK_DETAILS[0].HELP[0].IMG);
      setTextModal(MARK_DETAILS[0].HELP[0].DESC);
    }

    if (val == 5) {
      setImageModal(MARK_DETAILS[1].HELP[0].IMG);
      setTextModal(MARK_DETAILS[1].HELP[0].DESC);
    }

    if (val == 6) {
      setImageModal(MARK_DETAILS[2].HELP[0].IMG);
      setTextModal(MARK_DETAILS[2].HELP[0].DESC);
    }

    if (val == 7) {
      setImageModal(MARK_DETAILS[3].HELP[0].IMG);
      setTextModal(MARK_DETAILS[3].HELP[0].DESC);
    }

    if (val == 8) {
      setImageModal(MARK_DETAILS[4].HELP[0].IMG);
      setTextModal(MARK_DETAILS[4].HELP[0].DESC);
    }
    if (val == 9) {
      setImageModal(MARK_DETAILS[5].HELP[0].IMG);
      setTextModal(MARK_DETAILS[5].HELP[0].DESC);
    }
    if (val == 10) {
      setImageModal(MARK_DETAILS[6].HELP[0].IMG);
      setTextModal(MARK_DETAILS[6].HELP[0].DESC);
    }
    if (val == 11) {
      setImageModal(MARK_DETAILS[7].HELP[0].IMG);
      setTextModal(MARK_DETAILS[7].HELP[0].DESC);
    }

    if (val == 12) {
      setImageModal(MARK_DETAILS[8].HELP[0].IMG);
      setTextModal(MARK_DETAILS[8].HELP[0].DESC);
    }
    if (val == 13) {
      setImageModal(MARK_DETAILS[9].HELP[0].IMG);
      setTextModal(MARK_DETAILS[9].HELP[0].DESC);
    }
    if (val == 14) {
      setImageModal(MARK_DETAILS[10].HELP[0].IMG);
      setTextModal(MARK_DETAILS[10].HELP[0].DESC);
    }

    if (val == 15) {
      setImageModal(MARK_DETAILS[11].HELP[0].IMG);
      setTextModal(MARK_DETAILS[11].HELP[0].DESC);
    }

    if (val == 16) {
      setImageModal(MARK_DETAILS[12].HELP[0].IMG);
      setTextModal(MARK_DETAILS[12].HELP[0].DESC);
    }

    if (val == 17) {
      setImageModal(MARK_DETAILS[13].HELP[0].IMG);
      setTextModal(MARK_DETAILS[13].HELP[0].DESC);
    }

    if (val == 18) {
      setImageModal(MARK_DETAILS[14].HELP[0].IMG);
      setTextModal(MARK_DETAILS[14].HELP[0].DESC);
    }

    if (val == 19) {
      setImageModal(MARK_DETAILS[15].HELP[0].IMG);
      setTextModal(MARK_DETAILS[15].HELP[0].DESC);
    }

    if (val == 20) {
      setImageModal(MARK_DETAILS[16].HELP[0].IMG);
      setTextModal(MARK_DETAILS[16].HELP[0].DESC);
    }

    if (val == 21) {
      setImageModal(MARK_DETAILS[17].HELP[0].IMG);
      setTextModal(MARK_DETAILS[17].HELP[0].DESC);
    }

    if (val == 22) {
      setImageModal(MARK_DETAILS[18].HELP[0].IMG);
      setTextModal(MARK_DETAILS[18].HELP[0].DESC);
    }
  }

  // download image
  async function exportToPdf() {
     const wasInDetail = resetToAllLines(); 
    // Reset dulu posisi/scale gambar sebelum capture, sama seperti saveAnalysis() -
    // supaya PDF hasil export selalu menangkap gambar dari posisi default
    // (bukan posisi zoom/pan terakhir yang mungkin sedang dilihat user).
    refImageZoom.current.resetScale();
    refImageZoom.current.centerOn({
      x: 0,
      y: 0,
      scale: 1,
      duration: 0,
    });

    set_loading_global_handler(true);
    navigation.closeDrawer();

    const runCapture = async () => {
      try {
        // react-native-view-shot caputures component
        const uri = await captureRef(ref_capture.current, {
          format: 'png',
          quality: 0.0,
          result: 'base64',
        }).then(
          async (uri) => {
            // const res = await AesGcmCrypto.encrypt(uri, true, key);

            let patient = {
              fullname: fullname,
              gender: gender,
              birthdate: birthdate,
              ageInYears: ageInYears,
              race: race,
            };

            var htmlnya = await generateCephHtml(
              'Cephalometric',
              patient,
              'data:image/png;base64,' + uri + '',
              new Date(),
              sna,snb,anb,pogNB,snop,snmp,uina_angular,uina_linear,linb_angular,linb_linear,_iia,upper_lip,lower_lip,wendellWylie
            );

            console.log('####' + 'Masuk Report Viewer Ceph PDF');
            let options = {
              html: htmlnya,
              fileName: 'test',
              base64: true,
              // directory: 'Orthoceph',
              width:
                Platform.OS == 'ios' && widthScreen > 700 ? wp(140) : wp(150),
              height: Platform.OS == 'ios' ? wp(100) : wp(100),
            };

            let file = await generatePDF(options);

            navigation.navigate('FormPdfPreview', {
              fileName: fullname,
              fileBase64: file.base64,
            });
            set_loading_global_handler(false);
          },
          (error) => console.error('Oops, snapshot failed', error),
        );
      } catch (error) {
        console.log('error', error);
      }
    };

    // Sama seperti saveAnalysis(): tunggu 2 frame JS thread supaya native
    // driver sudah commit posisi/scale hasil reset, baru capture - lebih
    // reliable daripada capture langsung tanpa jeda sama sekali (perilaku
    // sebelumnya di fungsi ini).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
      const baseBuffer = Platform.OS === 'ios' ? 250 : 50;
      const safetyBuffer = wasInDetail ? baseBuffer + 300 : baseBuffer;   // ⬅️ UBAH
      setTimeout(runCapture, safetyBuffer);
    });
  });
  }

  const newAnalysis__ = (AI) => {
    console.log('Masuk New Analysis');
    set_headerText_handler('Cephalometric Analysis');
    set_bantuMarker_handler(0);
    // set_loading_global_handler(true);
    set_loading_handler(true);
    navigation.closeDrawer();

    setTimeout(() => {

      const options = {
      title: 'Choose Your Image',
      takePhotoButtonTitle: 'Take photo with your camera',
      chooseFromLibraryButtonTitle: 'Choose photo from library',
       includeBase64: true,
      // maxWidth: 500,
      // maxHeight: 500,
      quality: 1,
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        set_loading_handler(false);
        set_press_new_analysis_handler(false);
        set_press_save_analysis_handler(false);
        set_press_analysis_handler(false);
      } else if (response.errorCode) {
        console.log('Image Picker Error: ', response.errorMessage);
        set_loading_handler(false);
        set_press_analysis_handler(false);
        set_press_save_analysis_handler(false);
      } else {
        let source = {uri: response.assets[0].uri};

        let width_image = {uri: response.assets[0].width};
        let height_image = {uri: response.assets[0].height};

        console.log('width :' + JSON.stringify(width_image));
        console.log('height :' + JSON.stringify(height_image));

        set_width_last_device_handler(width_image.uri);
        set_height_last_device_handler(height_image.uri);
        
        set_imageuri_handler(response.assets[0].uri);
        set_imagetype_handler(response.assets[0].type);
        set_imagefilename_handler(response.assets[0].fileName);
        set_tempgambar_handler(source);
        set_bantuMarker_handler(1);
       
       
        set_select_id_handler(null);
        set_markingdot_handler(true);
        set_detailresult_handler(false);
        set_resultanalysis_handler(false);
        set_press_save_analysis_handler(false);
        set_press_analysis_handler(false);
        set_press_new_analysis_handler(false);
      
       
        // navigation.closeDrawer();

        marker = [];

        remove_startingPoint_handler([]);
        remove_endPoint_handler([]);
        set_calibrationDistance_handler(null);
        remove_sella_handler([]);
        remove_nasion_handler([]);
        remove_pointa_handler([]);
        remove_pointb_handler([]);
        remove_u6_handler([]);
        remove_u4_handler([]);
        remove_gonion_handler([]);
        remove_gnathion_handler([]);
        remove_isa_handler([]);
        remove_isi_handler([]);
        remove_iia_handler([]);
        remove_iii_handler([]);
        remove_ms_handler([]);
        remove_pogs_handler([]);
        remove_li_handler([]);
        remove_ls_handler([]);
        remove_pog_handler([]);
        remove_ans_handler([]);
        remove_menton_handler([]);

        remove_sna_handler([]);
        remove_snb_handler([]);
        remove_anb_handler([]);
        remove_pogNB_handler([]);
        remove_snop_handler([]);
        remove_snmp_handler([]);
        remove_uina_angular_handler([]);
        remove_uina_linear_handler([]);
        remove_linb_angular_handler([]);
        remove_linb_linear_handler([]);
        remove__iia_handler([]);
        remove_upper_lip_handler([]);
        remove_lower_lip_handler([]);
        remove_wendellwylie_handler([]);
        set_loading_handler(false);
        

        if(!AI){
          AI_Analysis(response.assets[0].base64);
        }
        
        


       
      }
    });
      
    }, 500);

    
  };

  const setIfValid = (value, setter) => {
                        if (value !== null && value !== undefined && value !== "") {
                            setter(value);
                        }
                    };

  const AI_Analysis = async (uri) =>{

    console.log('masuk AI');

     set_loading_global_handler(true);

     try {
        // react-native-view-shot caputures component
    

                var data = {
                  image_base64:uri,
                };

             
              _predict(data)
                .then((result) => {
                  
                  if (result) {
                    console.log('### Hasil ', JSON.stringify(result));
                
                
     
                  

                    const points = result?.points_canvas;

                    setIfValid(points?.sella, set_sella_handler);
                    setIfValid(points?.nasion, set_nasion_handler);
                    setIfValid(points?.pointA, set_pointa_handler);
                    setIfValid(points?.pointB, set_pointb_handler);
                    setIfValid(points?.u6, set_u6_handler);
                    setIfValid(points?.u4, set_u4_handler);
                    setIfValid(points?.gonion, set_gonion_handler);
                    setIfValid(points?.gnathion, set_gnathion_handler);
                    setIfValid(points?.isa, set_isa_handler);
                    setIfValid(points?.isi, set_isi_handler);
                    setIfValid(points?.iia, set_iia_handler);
                    setIfValid(points?.iii, set_iii_handler);
                    setIfValid(points?.ms, set_ms_handler);
                    setIfValid(points?.pogs, set_pogs_handler);
                    setIfValid(points?.ls, set_ls_handler);
                    setIfValid(points?.li, set_li_handler);
                    setIfValid(points?.pog, set_pog_handler);
                    setIfValid(points?.ans, set_ans_handler);
                    setIfValid(points?.menton, set_menton_handler);

                    set_loading_global_handler(false);

                      navigation.openDrawer();
                  } else {
                    console.log('points_canvas tidak ada di result. Struktur result:', Object.keys(result || {}));
                  }

             
                                
              })
              .catch((errornya) => {
                console.log('ERROR ### 1 :' + errornya);
                                
                set_loading_global_handler(false);
              });
        
        }catch (error) {
        console.log('error', error);
        
            set_loading_global_handler(false);
      }
  }

  // ==========
  // === Save Data Analysis
  useFocusEffect(
    React.useCallback(() => {
      console.log('pressanalysis = '+pressAnalysis);
      if (pressSaveAnalysis == true) {
        saveAnalysis();
      }

      return () => pressSaveAnalysis;
    }, [pressSaveAnalysis]),
  );

  // ==========
  // === New Analysis
  useFocusEffect(
    React.useCallback(() => {
      if (pressNewAnalysis == true) {
        newAnalysis__();
      }

      return () => pressNewAnalysis;
    }, [pressNewAnalysis]),
  );

  // ==========
  // === Reset Scale
  useFocusEffect(
    React.useCallback(() => {
     
      if (resetScaleImage == true) {
       set_reset_scale_image_handler(false);
        refImageZoom.current?.resetScale();
      }

      return () => resetScaleImage;
    }, [resetScaleImage]),
  );

const resetToAllLines = () => {
  const wasInDetail = selectid !== null && selectid !== undefined;

  set_select_id_handler(null);
  set_detailresult_handler(false);
  set_resultanalysis_handler(true);
  set_headerText_handler('Cephalometric ' + step);
  set_subHeaderText_handler('');

  return wasInDetail;
};

  function saveAnalysis() {
    const wasInDetail = resetToAllLines();

    refImageZoom.current.resetScale();

    // duration: 0 supaya langsung snap ke posisi/scale default tanpa animasi,
    // biar tidak "balapan" dengan resetScale() di atas.
    refImageZoom.current.centerOn({
      x: 0,
      y: 0,
      scale: 1,
      duration: 0,
    });

    // Animated.timing(fadeAnim, {
    //   toValue: 3,
    //   duration: 100,
    //   useNativeDriver: true,
    // }).start();

    set_loading_global_handler(true);

    navigation.closeDrawer();

    // resetScale()/centerOn() di atas jalan lewat native driver (useNativeDriver
    // pada ImageZoom), artinya commit posisi/scale final-nya dikirim balik ke JS
    // thread secara async lewat native bridge - bukan langsung di frame yang sama.
    // react-native-image-pan-zoom tidak menyediakan callback "animasi selesai"
    // untuk centerOn, jadi kita tidak bisa await ini secara langsung.
    //
    // Daripada menebak-nebak angka ms (sebelumnya: delay statis 500/900ms yang
    // kadang tetap kurang di device lambat, kadang kebuang percuma di device
    // cepat), kita tunggu 2 siklus requestAnimationFrame dulu - ini menjamin
    // capture jalan setelah JS thread sudah render ulang minimal 2x sejak
    // resetScale()/centerOn() dipanggil, baru sisa jeda kecil sebagai jaring
    // pengaman untuk native bridge commit di iOS yang cenderung butuh 1-2 frame
    // ekstra dibanding Android (Choreographer vs CADisplayLink).
    const runCapture = async () => {
      try {
        // react-native-view-shot caputures component
        const uri = await captureRef(ref_capture.current, {
          format: 'jpg',
          quality: 1.0,
          result: 'base64',
        }).then(
          async (uri) => {
            if (uri) {
              let patient = {
                fullname: fullname,
                gender: gender,
                birthdate: birthdate,
                ageInYears: ageInYears,
                race: race,
              };

              var htmlnya = await generateCephHtml(
                'Cephalometric',
                patient,
                'data:image/png;base64,' + uri + '',
                new Date(),
               sna,snb,anb,pogNB,snop,snmp,uina_angular,uina_linear,linb_angular,linb_linear,_iia,upper_lip,lower_lip,wendellWylie
              );

              let options = {
                html: htmlnya,
                fileName: 'test',
                base64: true,
                // directory: 'Orthoceph',
                width: 792,
                height: 612,
              };

              let file = await generatePDF(options);

              if (
                imageUri !== null &&
                tempGambar !== null &&
                file.base64 !== null
              ) {
                const data = new FormData();

                var data2 = {
                  patient_name: fullname,
                  patientid: patientid,
                  pdf_base64: file.base64,
                  step: step,
                };

                var data3 = {
                  patient_name: fullname,
                  patientid: patientid,
                  image_analysis: uri,
                  step: step,
                };

                _addImageAnalysis(data3)
                  .then((result3) => {
                    console.log(result3);
                    if (result3 == 200) {
                      _addPdfReport(data2)
                        .then((result2) => {
                          console.log(result2);
                          if (result2 == 200) {
                            data.append('fileImages', {
                              uri: imageUri,
                              type: imageType,
                              name: imageFileName,
                            });

                            data.append('patientid', patientid);
                            data.append('platform', Platform.OS);
                            data.append('patient_name', fullname);
                            data.append(
                              'width',
                              Dimensions.get('screen').width,
                            );
                            data.append(
                              'height',
                              Dimensions.get('screen').height,
                            );

                            data.append(
                              'startingPoint',
                              JSON.stringify(startingPoint[0]),
                            );
                            data.append(
                              'endPoint',
                              JSON.stringify(endPoint[0]),
                            );
                            data.append(
                              'calibrationDistance',
                              '' + calibrationDistance + '',
                            );
                            data.append(
                              'sella',
                              JSON.stringify(sella[0]),
                            );
                            data.append(
                              'nasion',
                              JSON.stringify(nasion[0]),
                            );
                            data.append(
                              'pointA',
                              JSON.stringify(pointa[0]),
                            );
                            data.append(
                              'pointB',
                              JSON.stringify(pointb[0]),
                            );
                            data.append('u6', JSON.stringify(u6[0]));
                            data.append('u4', JSON.stringify(u4[0]));
                            data.append(
                              'gonion',
                              JSON.stringify(gonion[0]),
                            );
                            data.append(
                              'gnathion',
                              JSON.stringify(gnathion[0]),
                            );
                            data.append('isa', JSON.stringify(isa[0]));
                            data.append('isi', JSON.stringify(isi[0]));
                            data.append('iia', JSON.stringify(iia[0]));
                            data.append('iii', JSON.stringify(iii[0]));
                            data.append('ms', JSON.stringify(ms[0]));
                            data.append('pogs', JSON.stringify(pogs[0]));
                            data.append('ls', JSON.stringify(ls[0]));
                            data.append('li', JSON.stringify(li[0]));
                            data.append('pog', JSON.stringify(pog[0]));
                            data.append('ans', JSON.stringify(ans[0]));
                            data.append(
                              'menton',
                              JSON.stringify(menton[0]),
                            );
                            data.append('step', step);
                            data.append('sna', JSON.stringify(sna));
                            data.append('snb', JSON.stringify(snb));
                            data.append('anb', JSON.stringify(anb));
                            data.append('pognb', JSON.stringify(pogNB));
                            data.append('snop', JSON.stringify(snop));
                            data.append('snmp', JSON.stringify(snmp));
                            data.append(
                              'uina_angular',
                              JSON.stringify(uina_angular),
                            );
                            data.append(
                              'uina_linear',
                              JSON.stringify(uina_linear),
                            );
                            data.append(
                              'linb_angular',
                              JSON.stringify(linb_angular),
                            );
                            data.append(
                              'linb_linear',
                              JSON.stringify(linb_linear),
                            );
                            data.append('_iia', JSON.stringify(_iia));
                            data.append(
                              'upper_lip',
                              JSON.stringify(upper_lip),
                            );
                            data.append(
                              'lower_lip',
                              JSON.stringify(lower_lip),
                            );
                            data.append(
                              'mid_face',
                              JSON.stringify(wendellWylie?.MIDFACE),
                            );
                            data.append(
                              'lower_face',
                              JSON.stringify(wendellWylie?.LOWERFACE),
                            );

                            _addAnalysisPatient(data)
                              .then((result) => {
                                console.log('RESULT ### 1 :' + result);
                                if (result == 200) {
                                  Toast.show({
                                    type: 'success',
                                    text1: 'Save Successfully',
                                    autohide: true,
                                    visibilityTime: 2500,
                                  });
                                  set_loading_global_handler(false);
                                  set_press_save_analysis_handler(false);
                                  set_enablesave_handler(true);
                                  set_loading_handler(false);
                                  navigation.openDrawer();
                                  // setTimeout(() => {
                                  //   navigation.goBack();
                                  // }, 1000);
                                } else {
                                  Toast.show({
                                    type: 'error',
                                    text1: 'Failed, Please Try Again!',
                                    autohide: true,
                                    visibilityTime: 2500,
                                  });
                                  set_loading_global_handler(false);
                                  set_press_save_analysis_handler(false);
                                }
                              })
                              .catch((errornya) => {
                                console.log('ERROR ### 1 :' + errornya);
                                set_loading_global_handler(false);
                                set_press_save_analysis_handler(false);
                                // ToastAndroid.show('LOG Error : ' + error, ToastAndroid.SHORT);
                              });
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                          set_loading_global_handler(false);
                          set_press_save_analysis_handler(false);
                        });
                    }
                  })
                  .catch((errornya) => {
                    console.log('ERROR ### 1 :' + errornya);
                    set_loading_global_handler(false);
                    set_press_save_analysis_handler(false);
                    // ToastAndroid.show('LOG Error : ' + error, ToastAndroid.SHORT);
                  });
              }

              if (
                imageUri == null &&
                tempGambar !== null &&
                file.base64 !== null
              ) {
                var data2 = {
                  patient_name: fullname,
                  patientid: patientid,
                  pdf_base64: file.base64,
                  step: step,
                };

                var data3 = {
                  patient_name: fullname,
                  patientid: patientid,
                  image_analysis: uri,
                  step: step,
                };

                _addImageAnalysis(data3)
                  .then((result3) => {
                    console.log(result3);
                    if (result3 == 200) {
                      _addPdfReport(data2)
                        .then((result2) => {
                          console.log(result2);
                          if (result2 == 200) {
                            var data = {
                              patient_name: fullname,
                              patientid: patientid,
                              platform: Platform.OS,
                              width: widthLastDevice,
                              height: heightLastDevice,
                              image_analysis: uri,
                              startingPoint: JSON.stringify(
                                startingPoint[0],
                              ),
                              endPoint: JSON.stringify(endPoint[0]),
                              calibrationDistance:
                                '' + calibrationDistance + '',
                              sella: JSON.stringify(sella[0]),
                              nasion: JSON.stringify(nasion[0]),
                              pointA: JSON.stringify(pointa[0]),
                              pointB: JSON.stringify(pointb[0]),
                              u6: JSON.stringify(u6[0]),
                              u4: JSON.stringify(u4[0]),
                              gonion: JSON.stringify(gonion[0]),
                              gnathion: JSON.stringify(gnathion[0]),
                              isa: JSON.stringify(isa[0]),
                              isi: JSON.stringify(isi[0]),
                              iia: JSON.stringify(iia[0]),
                              iii: JSON.stringify(iii[0]),
                              ms: JSON.stringify(ms[0]),
                              pogs: JSON.stringify(pogs[0]),
                              ls: JSON.stringify(ls[0]),
                              li: JSON.stringify(li[0]),
                              pog: JSON.stringify(pog[0]),
                              ans: JSON.stringify(ans[0]),
                              menton: JSON.stringify(menton[0]),
                              step: step,
                              sna: JSON.stringify(sna),
                              snb: JSON.stringify(snb),
                              anb: JSON.stringify(anb),
                              pognb: JSON.stringify(pogNB),
                              snop: JSON.stringify(snop),
                              snmp: JSON.stringify(snmp),

                              uina_angular: JSON.stringify(uina_angular),

                              uina_linear: JSON.stringify(uina_linear),

                              linb_angular: JSON.stringify(linb_angular),

                              linb_linear: JSON.stringify(linb_linear),

                              _iia: JSON.stringify(_iia),

                              upper_lip: JSON.stringify(upper_lip)
                                ? JSON.stringify(upper_lip)
                                : null,

                              lower_lip: JSON.stringify(lower_lip)
                                ? JSON.stringify(lower_lip)
                                : null,

                              mid_face: JSON.stringify(
                                wendellWylie.MIDFACE,
                              )
                                ? JSON.stringify(wendellWylie.MIDFACE)
                                : null,
                              lower_face: JSON.stringify(
                                wendellWylie.LOWERFACE,
                              )
                                ? JSON.stringify(wendellWylie.LOWERFACE)
                                : null,
                            };

                            _addAnalysisPatientExistingImage(data)
                              .then((result) => {
                                console.log(result);
                                if (result == 200) {
                                  Toast.show({
                                    type: 'success',
                                    text1: 'Save Successfully',
                                    // autohide: true,
                                    // visibilityTime: 2500,
                                  });

                                  set_loading_global_handler(false);
                                  set_press_save_analysis_handler(false);
                                  set_enablesave_handler(true);
                                  set_loading_handler(false);
                                  navigation.openDrawer();
                                  // set_press_save_analysis_handler(false);
                                  // setTimeout(() => {
                                  //   navigation.goBack();
                                  // }, 1000);
                                } else {
                                  Toast.show({
                                    type: 'info',
                                    text1: 'Failed, Please Try Again!',
                                    autohide: true,
                                    visibilityTime: 2500,
                                  });
                                  set_loading_global_handler(false);
                                  set_press_save_analysis_handler(false);
                                }
                              })
                              .catch((error) => {
                                console.log(error);
                                set_loading_global_handler(false);
                                set_press_save_analysis_handler(false);
                              });
                          } else {
                            Toast.show({
                              type: 'info',
                              text1: 'Failed, Please Try Again!',
                              autohide: true,
                              visibilityTime: 2500,
                            });
                            set_loading_global_handler(false);
                            set_press_save_analysis_handler(false);
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                          set_loading_global_handler(false);
                          set_press_save_analysis_handler(false);
                        });
                    } else {
                      Toast.show({
                        type: 'info',
                        text1: 'Failed, Please Try Again!',
                        autohide: true,
                        visibilityTime: 2500,
                      });
                      set_loading_global_handler(false);
                      set_press_save_analysis_handler(false);
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    set_loading_global_handler(false);
                    set_press_save_analysis_handler(false);
                  });
              }
            }
          },
          (error) => {
            console.error('Oops, snapshot failed', error);
            Toast.show({
               type: 'error',
               text1: 'Save data failed, please try again later!',
               autohide: true,
               visibilityTime: 2500,
            });
            set_loading_global_handler(false);
          },
        );
      } catch (error) {
        console.log('error', error);
         Toast.show({
               type: 'error',
               text1: 'Save data failed, please try again later!',
               autohide: true,
               visibilityTime: 2500,
            });
            set_loading_global_handler(false);
      }
    };

    // Tunggu 2 frame JS thread (menjamin native driver sudah commit posisi
    // final resetScale()/centerOn()), baru tambahkan buffer kecil - jauh lebih
    // kecil dari delay statis sebelumnya karena sebagian besar "tunggu" sudah
    // dijamin oleh rAF, bukan ditebak.
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // ⬇️ UBAH: tambah buffer kalau tadi sedang di mode detail,
      // karena Svg harus render ulang semua garis dulu
      const baseBuffer = Platform.OS === 'ios' ? 250 : 50;
      const safetyBuffer = wasInDetail ? baseBuffer + 300 : baseBuffer;
      setTimeout(runCapture, safetyBuffer);
    });
  });
  }

  async function _analysis() {
    console.log('ANALYSIS Form');
    navigation.closeDrawer();

    if (startingPoint.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Starting Point!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (endPoint.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position End Point!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (sella.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Sella!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (nasion.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Nasion!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (pointa.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Point A!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (pointb.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Point B!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (u6.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position U6!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (u4.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position U4!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (gonion.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Gonion!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (gnathion.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Gnathion!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (isa.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position ISA!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (isi.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position ISI!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (iia.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position IIA!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (iii.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position III!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (ms.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position MS!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (pogs.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Soft Pogonion (Pog`)!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (ls.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position LS!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (li.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position LI!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (pog.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Pogonion (Pog)!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (ans.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position ANS!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else if (menton.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Please select position Menton!',
        autohide: true,
        visibilityTime: 2500,
      });
    } else {
      console.log('masuk else');
      let _SNA = null;
      let _SNB = null;
      let _ANB = null;
      let _PogNB = null;
      let _SNOP = null;
      let _SNMP = null;
      let _UINA_Angular = null;
      let _UINA_Linear = null;
      let _LINB_Angular = null;
      let _LINB_Linear = null;
      let __IIA = null;
      let _Upper_Lip = null;
      let _Lower_Lip = null;
      let _WendellWylie = null;

      console.log('ANALYSIS Ceph');
      set_loading_global_handler(true);
      set_markingdot_handler(false);
      set_resultanalysis_handler(true);

      const _calibrationDistance = Number(calibrationDistance);
      const _calibrationPointDistance = await distanceBetween(
        startingPoint[0],
        endPoint[0],
      );

      let _calibrationRatio = 0;
      if (
        !isNaN(_calibrationDistance / _calibrationPointDistance) &&
        isFinite(_calibrationDistance / _calibrationPointDistance)
      )
        _calibrationRatio = _calibrationDistance / _calibrationPointDistance;

      _SNA = await SNA(sella[0], nasion[0], pointa[0]);
      set_sna_handler(_SNA);

      _SNB = await SNB(sella[0], nasion[0], pointb[0]);
      set_snb_handler(_SNB);
      _ANB = await ANB(pointa[0], nasion[0], pointb[0]);
      set_anb_handler(_ANB);
      _PogNB = await PogNB(
        pog[0],
        nasion[0],
        pointb[0],
        _calibrationRatio,
      );
      set_pogNB_handler(_PogNB);
      _SNOP = await SNOP(
        sella[0],
        nasion[0],
        u6[0],
        u4[0],
      );
      set_snop_handler(_SNOP);
      _SNMP = await SNMP(
        sella[0],
        nasion[0],
        gonion[0],
        gnathion[0],
      );
      set_snmp_handler(_SNMP);
      _UINA_Angular = await UINA_ANGULAR(
        nasion[0],
        pointa[0],
        isa[0],
        isi[0],
      );
      set_uina_angular_handler(_UINA_Angular);
      _UINA_Linear = await UINA_LINEAR(
        nasion[0],
        pointa[0],
        isa[0],
        isi[0],
        _calibrationRatio,
      );
      set_uina_linear_handler(_UINA_Linear);
      _LINB_Angular = await LINB_ANGULAR(
        nasion[0],
        pointb[0],
        iia[0],
        iii[0],
      );
      set_linb_angular_handler(_LINB_Angular);
      _LINB_Linear = await LINB_LINEAR(
        nasion[0],
        pointb[0],
        iia[0],
        iii[0],
        _calibrationRatio,
      );
      set_linb_linear_handler(_LINB_Linear);
      __IIA = await IIA(isa[0], isi[0], iia[0], iii[0]);
      set__iia_handler(__IIA);
      _Upper_Lip = await UPPER_LIP(
        ms[0],
        pogs[0],
        ls[0],
        _calibrationRatio,
      );
      set_upper_lip_handler(_Upper_Lip);
      _Lower_Lip = await LOWER_LIP(
        ms[0],
        pogs[0],
        li[0],
        _calibrationRatio,
      );
      set_lower_lip_handler(_Lower_Lip);
      _WendellWylie = await WendellWylie(
        nasion[0],
        ans[0],
        menton[0],
        _calibrationRatio,
      );

      set_wendellwylie_handler(_WendellWylie);

      set_reset_scale_image_handler(true);

    if (_WendellWylie.LOWERFACE.value) {

        set_enablesave_handler(true);
        set_loading_handler(false);
        set_loading_global_handler(false);
        navigation.openDrawer();
      
    }

      return null;
    }
  }

  function changeDotMarking(e) {
    if (e.scale >= 1 && e.scale < 2) {
      Animated.timing(fadeAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(strokeBorderAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (e.scale >= 2 && e.scale < 3) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(strokeBorderAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (e.scale >= 3) {
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(strokeBorderAnim, {
        toValue: 0.1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (e.scale < 1) {
      Animated.timing(fadeAnim, {
        toValue: 2,
        duration: 100,
        useNativeDriver: true,
      }).start();
      Animated.timing(strokeBorderAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }

  //back header
  function backActionHeader() {
    Alert.alert(
      'Do you want to save before exiting?',
      'Unsaved work will be lost.',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'DONT SAVE',
          onPress: () => {
            navigation.goBack();
          },
          style: 'cancel',
        },
        {text: 'SAVE', onPress: () => set_press_save_analysis_handler(true)},
      ],
    );
    return true;
  }

  // Export to PDF
  useEffect(() => {
    if (pressAnalysis == true) {
      exportToPdf();
      set_press_analysis_handler(false);
    }

    return () => {
      set_press_analysis_handler(false);
    };
  }, [pressAnalysis]);

  const STATUS_BAR_HEIGHT =
    Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

  function StatusBarPlaceHolder() {
    return (
      <View
        style={{
          width: '100%',
          height: STATUS_BAR_HEIGHT,
          backgroundColor: '#637363',
        }}>
        <StatusBar barStyle="light-content" backgroundColor="#637363" />
      </View>
    );
  }

  // Tinggi total header (StatusBar placeholder + Appbar.Header) diukur langsung
  // dari layout aslinya, bukan angka tetap, supaya caption di bawahnya tidak
  // ketutup header di iOS (notch / Dynamic Island bikin tinggi berbeda-beda).
  const [headerBlockHeight, set_headerBlockHeight] = useState(
    Platform.OS === 'ios' ? wp(25) : wp(14),
  );




  return (
    <>
   
      <ActivityIndicator
       animating={loadingGlobal}
        size={'large'}
        style={{
          position: 'absolute',
            zIndex: loadingGlobal == true ? 9999 : 0,
          bottom: 0,
          top: 0,
          right: 0,
          left: 0,
          justifyContent: 'center',
          alignSelf: 'center',
          backgroundColor: 'rgba(52, 52, 52, 0.8)',
          display: loadingGlobal == true ? 'flex' : 'none',
        }}
      />
      <View
        style={{
          flexDirection: 'column',
          backgroundColor: 'transparent',
          // alignSelf: 'baseline',
          // justifyContent: 'center',
          // width: 390,
          // height: 844,
          flex: 1,
        }}>
      <View
          onLayout={(e) => {
            const measuredHeight = e.nativeEvent.layout.height;
            if (measuredHeight > 0 && measuredHeight !== headerBlockHeight) {
              set_headerBlockHeight(measuredHeight);
            }
          }}>
        { Platform.OS === 'ios' ?  <StatusBarPlaceHolder /> : null} 

        <Appbar.Header
          style={{
            height:hp(7),
            backgroundColor: '#637363',
            // position: 'absolute',
            // top: 0,
            // left: 0,
            // right: 0,
            zIndex: 999999,
          }}>
          <Appbar.BackAction
            onPress={() =>
              tempGambar ? backActionHeader() : navigation.goBack()
            }
            color='white'
          />

          {bantuMarker == 3 ? (

            
            <TextInput
              value={calibrationDistance ? calibrationDistance : ''}
              onChangeText={(val) =>
                set_calibrationDistance_handler(val.replace(/,/g, '.'))
              }
              label={''}
              keyboardType="decimal-pad"
              returnKeyType="done"
              placeholder="Enter Distance (mm)"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              underlineColorAndroid={'transparent'}
              onSubmitEditing={() => navigation.openDrawer()}
              textAlignVertical="center"
              verticalAlign='middle'
              mode='flat'
              contentStyle={{paddingVertical:0}}
              style={{
                flex:1,
            height:50,
              justifyContent:'center',             
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
                 fontSize: 16,
                 
    borderWidth: 1,
    borderColor: '#ccc',
    verticalAlign: 'center', 
              }}
            />
          ) : (
            <Appbar.Content
              title={  <>
                    <Text variant="titleMedium" 
                          style={{ textAlign: 'center',
                          flexWrap: 'wrap',
                          fontSize: wp(3.5),color:'white'}}>{headerText}</Text>
                    <Text variant="bodySmall" style={{ textAlign: 'center',
                          flexWrap: 'wrap',
                          fontSize: wp(2.5),color:'white'}}>
                      {subHeaderText}
                    </Text>
                  </>}
              
            />

           
          )}

          {disablePointer !== 'none' ? (
            <>
              {tempGambar ? (
                <>
                  <Appbar.Action
                    style={{
                      display:
                        bantuMarker >= 1 && bantuMarker < 23
                          ? 'flex'
                          : 'none',
                    }}
                    size={wp(6)}
                    icon={'help-circle-outline'}
                    onPress={() => {
                      helpPopUp(bantuMarker);
                    }}
                    color="white"
                  />

                  <Appbar.Action
                    icon="menu"
                    onPress={() => {
                      navigation.openDrawer();
                    }}
                    color="white"
                  />
                </>
              ) : null}
            </>
          ) : (
            <Appbar.Action
              icon={'menu'}
              size={wp(6)}
              onPress={() => {
                navigation.openDrawer();
              }}
              color="white"
            />
          )}
        </Appbar.Header>
      </View>
        {/* <View
          style={{position: 'absolute', right: 0, left: 0, zIndex: 9999999}}>
          
        </View> */}
        {/* ======================================================================== */}

        {/* ======================================================================== */}

        {bantuMarker > 0 && bantuMarker <= 22 ? (
          <Animated.View
            style={{
              display: tempGambar ? 'flex' : 'none',
              // width: '100%',
              // height: wp(50),
              backgroundColor: 'black',
              position: 'absolute',
              transform: [{translateX: fadeIn}],
              zIndex: 1,
              left: 0,
              right: 0,
              top: headerBlockHeight,
              // flexShrink: 1,
            }}>
            <Text
              style={{
                textAlign: 'justify',
                color: 'white',
                fontSize: wp(2.5),
                // flexWrap: 'wrap',
                // flexGrow: 1,
                paddingHorizontal: wp(5),
                paddingVertical: wp(2),
              }}>
              {titleText}
            </Text>
          </Animated.View>
        ) : null}

        <View style={styles.container}>
          {titleText ? (
            <>
              {loading ? (
                <>
                  <ActivityIndicator
                    animating={loading}
                    style={{alignSelf: 'center', marginTop: wp(-50)}}
                    size="large"
                    color="white"
                  />
                </>
              ) : (
                <ViewShot
                  ref={ref_capture}
                  options={{
                    width: '100%',
                    height: '100%',
                    fileName: 'captureImage',
                    format: 'png',
                    quality: 1,
                    result: 'base64',
                  }}>
                  <ImageZoom
                    ref={refImageZoom}
                    cropWidth={375}
                    cropHeight={667}
                    style={{alignSelf: 'center'}}
                    imageWidth={375}
                    imageHeight={667}
                    useNativeDriver={true}
                    enableCenterFocus={true}
                    minScale={1}
                    panToMove={true}
                    pinchToZoom={true}
                    onMove={(e) => {
                      changeDotMarking(e);
                      // touch_count = 3;
                    }}
                    onClick={(e) => {                         // ⬅️ TAMBAHKAN INI
                      _clickImage(e, false, false, false, false);
                    }}
                    // onMoveShouldSetPanResponder={(e) => true}
                    // centerOn={scaleScreen}
                  >
                    <ImageBackground
                      source={tempGambar}
                      resizeMode="contain"
                      style={{
                        minWidth: 375,
                        minHeight: 667,
                      }}>
                      <View
                        style={{
                          width: '100%',
                          height: '100%',
                          // backgroundColor: 'grey',
                        }}
                        // onTouchMove={(e) => {
                        //   setTimeout(() => {
                        //     touch_count = 3;
                        //   }, 150);
                        // }}
                        // onTouchEnd={(e) => {
                        //   if (touch_count === 0 && Platform.OS == 'android') {
                        //     _clickImage(
                        //       e.nativeEvent,
                        //       false,
                        //       false,
                        //       false,
                        //       false,
                        //     );
                        //   }
                        //   if (touch_count === 1 && Platform.OS == 'ios') {
                        //     _clickImage(
                        //       e.nativeEvent,
                        //       false,
                        //       false,
                        //       false,
                        //       false,
                        //     );
                        //   }
                        // }}

                          onTouchStart={() => { isMoving = false; }}
                          onTouchMove={() => { isMoving = true; }}
                          onTouchEnd={(e) => {
                            if (!isMoving) {
                              _clickImage(e.nativeEvent, false, false, false, false);
                            }
                          }}
                        // onTouchStart={(e) => {
                        //   touch_count = e.nativeEvent.identifier;
                        // }}
                        >
                        <Svg
                          style={{
                            position: 'absolute',
                            zIndex: 998,
                            minWidth: 375,
                            minHeight: 667,
                          }}>
                          {/* {bantuMarker > 0 &&
                          marker.length > 0 &&
                          selectid == null &&
                          bantuClick == true
                            ? marker.map((value, index) => {
                                if (value?.x && value?.y) {
                                  if (
                                    bantuMarker > 3 &&
                                    bantuMarker <= 22
                                  ) {
                                    console.log(
                                      parseInt(index + 2) +
                                        ' ==== ' +
                                        bantuMarker,
                                    );
                                    if (
                                      parseInt(index + 2) == bantuMarker
                                    ) {
                                      console.log('###### MASUK #####');
                                      return (
                                        <AnimatedCircle
                                          key={index}
                                          cx={value.x}
                                          cy={value.y}
                                          r={fadeAnim}
                                          fill="red"
                                          stroke="yellow"
                                          strokeWidth={strokeBorderAnim}
                                        />
                                      );
                                    } else {
                                      return (
                                        <AnimatedCircle
                                          key={index}
                                          cx={value.x}
                                          cy={value.y}
                                          r={fadeAnim}
                                          fill="green"
                                          stroke="yellow"
                                          strokeWidth={strokeBorderAnim}
                                        />
                                      );
                                    }
                                  } else if (bantuMarker === 3) {
                                    return (
                                      <AnimatedCircle
                                        key={index}
                                        cx={value.x}
                                        cy={value.y}
                                        r={fadeAnim}
                                        fill="green"
                                        stroke="yellow"
                                        strokeWidth={strokeBorderAnim}
                                      />
                                    );
                                  } else {
                                    if (
                                      parseInt(index + 1) == bantuMarker
                                    ) {
                                      return (
                                        <AnimatedCircle
                                          key={index}
                                          cx={value.x}
                                          cy={value.y}
                                          r={fadeAnim}
                                          fill="red"
                                          stroke="yellow"
                                          strokeWidth={strokeBorderAnim}
                                        />
                                      );
                                    } else {
                                      return (
                                        <AnimatedCircle
                                          key={index}
                                          cx={value.x}
                                          cy={value.y}
                                          r={fadeAnim}
                                          fill="green"
                                          stroke="yellow"
                                          strokeWidth={strokeBorderAnim}
                                        />
                                      );
                                    }
                                  }
                                }
                              })
                            : null} */}

                          {/* {console.log(
                            actuatedNormalize(startingPoint[0]?.x),
                          )} */}
                          {startingPoint[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={startingPoint[0]?.x}
                              cy={startingPoint[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 1 &&
                                startingPoint.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {endPoint[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={endPoint[0]?.x}
                              cy={endPoint[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 2 &&
                                endPoint.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}

                          {sella[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={sella[0]?.x}
                              cy={sella[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 4 && sella.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {nasion[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={nasion[0]?.x}
                              cy={nasion[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 5 &&
                                nasion.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {pointa[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={pointa[0]?.x}
                              cy={pointa[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 6 &&
                                pointa.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {pointb[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={pointb[0]?.x}
                              cy={pointb[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 7 &&
                                pointb.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {u6[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={u6[0]?.x}
                              cy={u6[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 8 && u6.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {u4[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={u4[0]?.x}
                              cy={u4[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 9 && u4.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {gonion[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={gonion[0]?.x}
                              cy={gonion[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 10 &&
                                gonion.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {gnathion[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={gnathion[0]?.x}
                              cy={gnathion[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 11 &&
                                gnathion.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {isa[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={isa[0]?.x}
                              cy={isa[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 12 && isa.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {isi[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={isi[0]?.x}
                              cy={isi[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 13 && isi.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {iia[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={iia[0]?.x}
                              cy={iia[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 14 && iia.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {iii[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={iii[0]?.x}
                              cy={iii[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 15 && iii.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {ms[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={ms[0]?.x}
                              cy={ms[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 16 && ms.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {pogs[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={pogs[0]?.x}
                              cy={pogs[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 17 && pogs.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {ls[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={ls[0]?.x}
                              cy={ls[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 18 && ls.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {li[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={li[0]?.x}
                              cy={li[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 19 && li.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {pog[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={pog[0]?.x}
                              cy={pog[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 20 && pog.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {ans[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={ans[0]?.x}
                              cy={ans[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 21 && ans.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {menton[0]?.x ? (
                            <AnimatedCircle
                              key={Math.random()}
                              cx={menton[0]?.x}
                              cy={menton[0]?.y}
                              r={fadeAnim}
                              fill={
                                bantuMarker == 22 &&
                                menton.length > 0
                                  ? 'red'
                                  : 'green'
                              }
                              stroke="yellow"
                              strokeWidth={strokeBorderAnim}
                            />
                          ) : null}
                          {startingPoint[0]?.x && endPoint[0]?.x ? (
                            <Line
                              x1={startingPoint[0]?.x}
                              y1={startingPoint[0]?.y}
                              x2={endPoint[0]?.x}
                              y2={endPoint[0]?.y}
                              stroke="#8AFF06"
                              strokeWidth="0.8"
                            />
                          ) : null}
                          {markingDot !== true ? (
                            <>
                              {selectid == null ? (
                                <>
                                  {/* ==== SNA ==== */}
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  {/* <Polygon
                                    points={
                                      '' +
                                      nasion[0]?.x +
                                      ',' +
                                      nasion[0]?.y +
                                      ' ' +
                                      parseFloat(nasion[0]?.x) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 5) +
                                      ' ' +
                                      parseFloat(nasion[0]?.x - 5) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 1) +
                                      ''
                                    }
                                    fill="yellow"
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  /> */}

                                  <AngleArc angle={sna.analysis?.angle} />
                                  {/* ==== SNB ==== */}
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  {/* 
                                  <Polygon
                                    points={
                                      '' +
                                      nasion[0]?.x +
                                      ',' +
                                      nasion[0]?.y +
                                      ' ' +
                                      parseFloat(nasion[0]?.x) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 5) +
                                      ' ' +
                                      parseFloat(nasion[0]?.x - 5) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 1) +
                                      ''
                                    }
                                    fill="yellow"
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  /> */}

                                  <AngleArc angle={snb.analysis?.angle} />
                                  {/* ==== ANB ==== */}
                                  <Line
                                    x1={pointa[0]?.x}
                                    y1={pointa[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  {/* <Polygon
                                    points={
                                      '' +
                                      nasion[0]?.x +
                                      ',' +
                                      nasion[0]?.y +
                                      ' ' +
                                      parseFloat(nasion[0]?.x) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 5) +
                                      ' ' +
                                      parseFloat(nasion[0]?.x - 5) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 1) +
                                      ''
                                    }
                                    fill="yellow"
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  /> */}

                                  <AngleArc angle={anb.analysis?.angle} />
                                  {/* ==== PogNB ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={pogNB.analysis?.lines[0].startX}
                                    y1={pogNB.analysis?.lines[0].startY}
                                    x2={pogNB.analysis?.lines[0].endX}
                                    y2={pogNB.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={pogNB.analysis?.lines[1].startX}
                                    y1={pogNB.analysis?.lines[1].startY}
                                    x2={pogNB.analysis?.lines[1].endX}
                                    y2={pogNB.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  {/* ==== SNOP ==== */}
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={u6[0]?.x}
                                    y1={u6[0]?.y}
                                    x2={u4[0]?.x}
                                    y2={u4[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={snop.analysis?.lines[0].startX}
                                    y1={snop.analysis?.lines[0].startY}
                                    x2={snop.analysis?.lines[0].endX}
                                    y2={snop.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2,2"
                                  />
                                  <Line
                                    x1={snop.analysis?.lines[1].startX}
                                    y1={snop.analysis?.lines[1].startY}
                                    x2={snop.analysis?.lines[1].endX}
                                    y2={snop.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2,2"
                                  />

                                  <AngleArc angle={snop.analysis?.angle} />
                                  {/* ==== SNMP ==== */}

                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={gonion[0]?.x}
                                    y1={gonion[0]?.y}
                                    x2={gnathion[0]?.x}
                                    y2={gnathion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={snmp.analysis?.lines[0].startX}
                                    y1={snmp.analysis?.lines[0].startY}
                                    x2={snmp.analysis?.lines[0].endX}
                                    y2={snmp.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={snmp.analysis?.lines[1].startX}
                                    y1={snmp.analysis?.lines[1].startY}
                                    x2={snmp.analysis?.lines[1].endX}
                                    y2={snmp.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  <AngleArc angle={snmp.analysis?.angle} />
                                  {/* ==== UINA LINEAR ==== */}

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      uina_angular.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      uina_angular.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      uina_angular.analysis?.lines[0].endX
                                    }
                                    y2={
                                      uina_angular.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  <AngleArc angle={uina_angular.analysis?.angle} />
                                  {/* ==== UINA LINEAR ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      uina_linear.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      uina_linear.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      uina_linear.analysis?.lines[0].endX
                                    }
                                    y2={
                                      uina_linear.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      uina_linear.analysis?.lines[1]
                                        .startX
                                    }
                                    y1={
                                      uina_linear.analysis?.lines[1]
                                        .startY
                                    }
                                    x2={
                                      uina_linear.analysis?.lines[1].endX
                                    }
                                    y2={
                                      uina_linear.analysis?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  {/* ==== LINB ANGULAR ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  <AngleArc angle={linb_angular.analysis?.angle} />
                                  {/* ==== LINB Linear ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      linb_linear.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      linb_linear.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      linb_linear.analysis?.lines[0].endX
                                    }
                                    y2={
                                      linb_linear.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  {/* ==== IIA  ==== */}
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={_iia.analysis?.lines[0].startX}
                                    y1={_iia.analysis?.lines[0].startY}
                                    x2={_iia.analysis?.lines[0].endX}
                                    y2={_iia.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={_iia.analysis?.lines[1].startX}
                                    y1={_iia.analysis?.lines[1].startY}
                                    x2={_iia.analysis?.lines[1].endX}
                                    y2={_iia.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  <AngleArc angle={_iia.analysis?.angle} />
                                  {/* ==== UPPER LIP ==== */}
                                  <Line
                                    x1={ms[0]?.x}
                                    y1={ms[0]?.y}
                                    x2={pogs[0]?.x}
                                    y2={pogs[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      upper_lip.analysis?.lines[1].startX
                                    }
                                    y1={
                                      upper_lip.analysis?.lines[1].startY
                                    }
                                    x2={upper_lip.analysis?.lines[1].endX}
                                    y2={upper_lip.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  {/* ==== LOWER LIP ==== */}
                                  <Line
                                    x1={ms[0]?.x}
                                    y1={ms[0]?.y}
                                    x2={pogs[0]?.x}
                                    y2={pogs[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      lower_lip.analysis?.lines[1].startX
                                    }
                                    y1={
                                      lower_lip.analysis?.lines[1].startY
                                    }
                                    x2={lower_lip.analysis?.lines[1].endX}
                                    y2={lower_lip.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  {/* ==== MID FACE ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={ans[0]?.x}
                                    y2={ans[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={ans[0]?.x}
                                    y1={ans[0]?.y}
                                    x2={menton[0]?.x}
                                    y2={menton[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />

                                  {/* ==== LOWER FACE ==== */}
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={ans[0]?.x}
                                    y2={ans[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={ans[0]?.x}
                                    y1={ans[0]?.y}
                                    x2={menton[0]?.x}
                                    y2={menton[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}
                              {/* ==== SNA ==== */}
                              {selectid == 'IDS/ANALYSIS/SNA' ? (
                                <>
                                  <AnimatedCircle
                                    cx={sella[0]?.x}
                                    cy={sella[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointa[0]?.x}
                                    cy={pointa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <AngleArc angle={sna.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== SNB ==== */}
                              {selectid == 'IDS/ANALYSIS/SNB' ? (
                                <>
                                  <AnimatedCircle
                                    cx={sella[0]?.x}
                                    cy={sella[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointb[0]?.x}
                                    cy={pointb[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  {/* <Polygon
                                    points={
                                      '' +
                                      nasion[0]?.x +
                                      ',' +
                                      nasion[0]?.y +
                                      ' ' +
                                      parseFloat(nasion[0]?.x) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 5) +
                                      ' ' +
                                      parseFloat(nasion[0]?.x - 5) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 1) +
                                      ''
                                    }
                                    fill="yellow"
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  /> */}

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <AngleArc angle={snb.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== ANB ==== */}
                              {selectid == 'IDS/ANALYSIS/ANB' ? (
                                <>
                                  <AnimatedCircle
                                    cx={pointa[0]?.x}
                                    cy={pointa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointb[0]?.x}
                                    cy={pointb[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={pointa[0]?.x}
                                    y1={pointa[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />

                                  {/* <Polygon
                                    points={
                                      '' +
                                      nasion[0]?.x +
                                      ',' +
                                      nasion[0]?.y +
                                      ' ' +
                                      parseFloat(nasion[0]?.x) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 5) +
                                      ' ' +
                                      parseFloat(pointb[0]?.x - 5) +
                                      ',' +
                                      parseFloat(nasion[0]?.y + 1) +
                                      ''
                                    }
                                    fill="yellow"
                                    stroke="yellow"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  /> */}
                                  <AngleArc angle={anb.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== PogNB ==== */}
                              {selectid == 'IDS/ANALYSIS/POGNB' ? (
                                <>
                                  <AnimatedCircle
                                    cx={pog[0]?.x}
                                    cy={pog[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointb[0]?.x}
                                    cy={pointb[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={pogNB.analysis?.lines[0].startX}
                                    y1={pogNB.analysis?.lines[0].startY}
                                    x2={pogNB.analysis?.lines[0].endX}
                                    y2={pogNB.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={pogNB.analysis?.lines[1].startX}
                                    y1={pogNB.analysis?.lines[1].startY}
                                    x2={pogNB.analysis?.lines[1].endX}
                                    y2={pogNB.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== SNOP ==== */}
                              {selectid == 'IDS/ANALYSIS/SNOP' ? (
                                <>
                                  <AnimatedCircle
                                    cx={sella[0]?.x}
                                    cy={sella[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={u6[0]?.x}
                                    cy={u6[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={u4[0]?.x}
                                    cy={u4[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={u6[0]?.x}
                                    y1={u6[0]?.y}
                                    x2={u4[0]?.x}
                                    y2={u4[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={snop.analysis?.lines[0].startX}
                                    y1={snop.analysis?.lines[0].startY}
                                    x2={snop.analysis?.lines[0].endX}
                                    y2={snop.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2,2"
                                  />
                                  <Line
                                    x1={snop.analysis?.lines[1].startX}
                                    y1={snop.analysis?.lines[1].startY}
                                    x2={snop.analysis?.lines[1].endX}
                                    y2={snop.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2,2"
                                  />
                                  <AngleArc angle={snop.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== SNMP ==== */}
                              {selectid == 'IDS/ANALYSIS/SNMP' ? (
                                <>
                                  <AnimatedCircle
                                    cx={sella[0]?.x}
                                    cy={sella[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={gonion[0]?.x}
                                    cy={gonion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={gnathion[0]?.x}
                                    cy={gnathion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />

                                  <Line
                                    x1={sella[0]?.x}
                                    y1={sella[0]?.y}
                                    x2={nasion[0]?.x}
                                    y2={nasion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={gonion[0]?.x}
                                    y1={gonion[0]?.y}
                                    x2={gnathion[0]?.x}
                                    y2={gnathion[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={snmp.analysis?.lines[0].startX}
                                    y1={snmp.analysis?.lines[0].startY}
                                    x2={snmp.analysis?.lines[0].endX}
                                    y2={snmp.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={snmp.analysis?.lines[1].startX}
                                    y1={snmp.analysis?.lines[1].startY}
                                    x2={snmp.analysis?.lines[1].endX}
                                    y2={snmp.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <AngleArc angle={snmp.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== UINA ANGULAR ==== */}
                              {selectid == 'IDS/ANALYSIS/UINA_ANGULAR' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointa[0]?.x}
                                    cy={pointa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={isa[0]?.x}
                                    cy={isa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={isi[0]?.x}
                                    cy={isi[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={sella[0]?.x}
                                    cy={sella[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      uina_angular.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      uina_angular.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      uina_angular.analysis?.lines[0].endX
                                    }
                                    y2={
                                      uina_angular.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <AngleArc angle={uina_angular.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== UINA LINEAR ==== */}
                              {selectid == 'IDS/ANALYSIS/UINA_LINEAR' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointa[0]?.x}
                                    cy={pointa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={isa[0]?.x}
                                    cy={isa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />

                                  <AnimatedCircle
                                    cx={isi[0]?.x}
                                    cy={isi[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointa[0]?.x}
                                    y2={pointa[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      uina_linear.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      uina_linear.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      uina_linear.analysis?.lines[0].endX
                                    }
                                    y2={
                                      uina_linear.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      uina_linear.analysis?.lines[1]
                                        .startX
                                    }
                                    y1={
                                      uina_linear.analysis?.lines[1]
                                        .startY
                                    }
                                    x2={
                                      uina_linear.analysis?.lines[1].endX
                                    }
                                    y2={
                                      uina_linear.analysis?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== LINB ANGULAR ==== */}
                              {selectid == 'IDS/ANALYSIS/LINB_ANGULAR' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointb[0]?.x}
                                    cy={pointb[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={iii[0]?.x}
                                    cy={iii[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={iia[0]?.x}
                                    cy={iia[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <AngleArc angle={linb_angular.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== LINB Linear ==== */}
                              {selectid == 'IDS/ANALYSIS/LINB_LINEAR' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pointb[0]?.x}
                                    cy={pointb[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={iii[0]?.x}
                                    cy={iii[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={iia[0]?.x}
                                    cy={iia[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={pointb[0]?.x}
                                    y2={pointb[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      linb_linear.analysis?.lines[0]
                                        .startX
                                    }
                                    y1={
                                      linb_linear.analysis?.lines[0]
                                        .startY
                                    }
                                    x2={
                                      linb_linear.analysis?.lines[0].endX
                                    }
                                    y2={
                                      linb_linear.analysis?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== IIA  ==== */}
                              {selectid == 'IDS/ANALYSIS/IIA' ? (
                                <>
                                  <AnimatedCircle
                                    cx={iii[0]?.x}
                                    cy={iii[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={iia[0]?.x}
                                    cy={iia[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={isa[0]?.x}
                                    cy={isa[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={isi[0]?.x}
                                    cy={isi[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={iii[0]?.x}
                                    y1={iii[0]?.y}
                                    x2={iia[0]?.x}
                                    y2={iia[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={isa[0]?.x}
                                    y1={isa[0]?.y}
                                    x2={isi[0]?.x}
                                    y2={isi[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={_iia.analysis?.lines[0].startX}
                                    y1={_iia.analysis?.lines[0].startY}
                                    x2={_iia.analysis?.lines[0].endX}
                                    y2={_iia.analysis?.lines[0].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={_iia.analysis?.lines[1].startX}
                                    y1={_iia.analysis?.lines[1].startY}
                                    x2={_iia.analysis?.lines[1].endX}
                                    y2={_iia.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <AngleArc angle={_iia.analysis?.angle} />
                                </>
                              ) : null}

                              {/* ==== UPPER LIP ==== */}
                              {selectid == 'IDS/ANALYSIS/UPPER_LIP' ? (
                                <>
                                  <AnimatedCircle
                                    cx={ms[0]?.x}
                                    cy={ms[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pogs[0]?.x}
                                    cy={pogs[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={ls[0]?.x}
                                    cy={ls[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={ms[0]?.x}
                                    y1={ms[0]?.y}
                                    x2={pogs[0]?.x}
                                    y2={pogs[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      upper_lip.analysis?.lines[1].startX
                                    }
                                    y1={
                                      upper_lip.analysis?.lines[1].startY
                                    }
                                    x2={upper_lip.analysis?.lines[1].endX}
                                    y2={upper_lip.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== LOWER LIP ==== */}
                              {selectid == 'IDS/ANALYSIS/LOWER_LIP' ? (
                                <>
                                  <AnimatedCircle
                                    cx={ms[0]?.x}
                                    cy={ms[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={pogs[0]?.x}
                                    cy={pogs[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={li[0]?.x}
                                    cy={li[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <Line
                                    x1={ms[0]?.x}
                                    y1={ms[0]?.y}
                                    x2={pogs[0]?.x}
                                    y2={pogs[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      lower_lip.analysis?.lines[1].startX
                                    }
                                    y1={
                                      lower_lip.analysis?.lines[1].startY
                                    }
                                    x2={lower_lip.analysis?.lines[1].endX}
                                    y2={lower_lip.analysis?.lines[1].endY}
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== MID FACE ==== */}
                              {selectid == 'IDS/ANALYSIS/MIDFACE' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={ans[0]?.x}
                                    cy={ans[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={menton[0]?.x}
                                    cy={menton[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={ans[0]?.x}
                                    y2={ans[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={ans[0]?.x}
                                    y1={ans[0]?.y}
                                    x2={menton[0]?.x}
                                    y2={menton[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].startX
                                    }
                                    y1={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].startY
                                    }
                                    x2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].endX
                                    }
                                    y2={
                                      wendellWylie.MIDFACE?.analysis
                                        ?.lines[2].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}

                              {/* ==== LOWER FACE ==== */}
                              {selectid == 'IDS/ANALYSIS/LOWERFACE' ? (
                                <>
                                  <AnimatedCircle
                                    cx={nasion[0]?.x}
                                    cy={nasion[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={ans[0]?.x}
                                    cy={ans[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />
                                  <AnimatedCircle
                                    cx={menton[0]?.x}
                                    cy={menton[0]?.y}
                                    r={fadeAnim}
                                    fill="green"
                                    stroke="yellow"
                                    strokeWidth="0.5"
                                  />

                                  <Line
                                    x1={nasion[0]?.x}
                                    y1={nasion[0]?.y}
                                    x2={ans[0]?.x}
                                    y2={ans[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={ans[0]?.x}
                                    y1={ans[0]?.y}
                                    x2={menton[0]?.x}
                                    y2={menton[0]?.y}
                                    stroke="#8AFF06"
                                    strokeWidth="0.8"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[0].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[1].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                  <Line
                                    x1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].startX
                                    }
                                    y1={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].startY
                                    }
                                    x2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].endX
                                    }
                                    y2={
                                      wendellWylie.LOWERFACE?.analysis
                                        ?.lines[2].endY
                                    }
                                    stroke="yellow"
                                    strokeWidth="0.8"
                                    stroke-linecap="round"
                                    strokeDasharray="2"
                                  />
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </Svg>
                      </View>
                    </ImageBackground>

                    <View style={{margin: wp(20)}} />
                  </ImageZoom>

                  {/* </View> */}
                </ViewShot>
              )}
            </>
          ) : (
            <>
              {loading ? (
                <>
                  <ActivityIndicator
                    animating={loading}
                    style={{alignSelf: 'center', marginTop: wp(-50)}}
                    size="large"
                    color="white"
                  />
                </>
              ) : (
                <View style={{marginTop: wp(-50), justifyContent:'center',alignItems:'center'}}>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    backgroundColor: '#34A853',
                    borderRadius: 10,
                    marginVertical: wp(2)
                  }}
                  onPress={() => newAnalysis__(true)}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      textAlign: 'center',
                      paddingVertical: wp(2),
                      paddingHorizontal:wp(2)
                    }}>
                    Create New Worksheet Manual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    backgroundColor: '#34A853',
                    borderRadius: 10,
                    marginVertical: wp(2)
                  }}
                  onPress={() => newAnalysis__(false)}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      textAlign: 'center',
                      paddingVertical: wp(2),
                      paddingHorizontal:wp(2)
                    }}>
                    Create New Worksheet Using AI (Beta)
                  </Text>
                </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        <View
          pointerEvents={disablePointer}
          style={{
            flexDirection: 'row',
            backgroundColor: '#637363',
            opacity: opacityPointer,
            borderRadius: 5,
            justifyContent: 'space-between',
            position: 'absolute',
            bottom: Platform.OS === 'android' ? 0 : hp(2),
            left: 0,
            right: 0,
            paddingVertical: wp(1),
          }}>
          {/*================ PREVIOUS EVENT ============*/}
          <TouchableOpacity
            onPress={() => _prevClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="controller-fast-backward" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Prev
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => _leftClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="arrow-bold-left" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Left
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => _upClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="arrow-bold-up" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => _downClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="arrow-bold-down" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Down
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => _rightClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="arrow-bold-right" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Right
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => _nextClick()}
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Entypo name="controller-fast-forward" size={30} color="white" />
            <Text style={{color: 'white', textAlign: 'center', fontSize: 11}}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL ================================================ */}

        <View>
          <Modal
            style={{width: '90%', alignSelf: 'center'}}
            isVisible={modalVisible}>
            <View
              style={{
                flexDirection: 'row',
                height: hp(5),
                backgroundColor: '#637363',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: wp(2),
              }}>
              <View style={{flexDirection: 'row'}}>
                <MaterialCommunityIcons
                  size={wp(5)}
                  name="text"
                  color={'white'}
                />
                <Text
                  style={{
                    fontSize: wp(3.5),
                    marginLeft: wp(5),
                    color: 'white',
                  }}>
                  Short Description
                </Text>
              </View>
              <TouchableOpacity
                style={{backgroundColor: 'white'}}
                onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" style={{padding: 2}} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'column',
                height: '70%',
                backgroundColor: 'white',
                padding: wp(2),
              }}>
              <ImageZoom
                cropWidth={wp(85)}
                cropHeight={hp(40)}
                imageWidth={wp(85)}
                imageHeight={hp(40)}
                minScale={1}
                useNativeDriver={true}
                enableCenterFocus={true}
                style={{borderWidth: 0.5, borderRadius: 5}}
                panToMove={true}
                pinchToZoom={true}>
                <Image
                  style={{
                    width: wp(85),
                    height: hp(40),
                    resizeMode: 'contain',
                  }}
                  source={imageModal}
                />
              </ImageZoom>

              <Text style={{fontSize: wp(2.5), marginVertical: hp(1)}}>
                {textModal}
              </Text>
              <Text style={{fontSize: wp(2.5), marginVertical: hp(1.2)}}>
                {
                  'Use the Left, Up, Down, Right button to move the mark to a more precise location'
                }
              </Text>
              <Text style={{fontSize: wp(2.5), marginVertical: hp(1.2)}}>
                {
                  'You can zoom in/out and drag the image for a better view. Press the Next button to save & continue'
                }
              </Text>
            </View>
          </Modal>
        </View>

        {/* MODAL ================================================ */}
      </View>
    </>
  );
};

export default FormCephalometricAnalysis;

const styles = StyleSheet.create({
  container: {
    // width: guidelineBaseWidth,
    // height: guidelineBaseHeight,
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#093545',
    justifyContent: 'center',
  },

  containerItem: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 10,
    backgroundColor: '#224957',
  },
  focalPoint: {
    ...StyleSheet.absoluteFillObject,
    width: 20,
    height: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
});
