import React, { Component } from "react";
import EventBus from "eventing-bus";
import { connect } from "react-redux";
import { PlaidLink } from "react-plaid-link";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import Steps from "../../../components/Steps";

import {
  signAddBank,
  logout,
  plaidUpload,
  signSkipBank,
  plaidSetup,
} from "../../../store/actions/Auth";
import ReactGA from "react-ga";

const brnv = require("bank-routing-number-validator");

class AccountDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageContent: "",
      isDisabled: false,
      plaidCheck: false,
      manualCheck: false,
      isRoutingValid: true,
      accountsMatched: true,
      isValidName: true,
      isRiskProfileComplete: false,
      investorAssociation: "",
      isFamilyMember: false,
      isFinraEmployed: false,
      isTradingLowSecurities: false,
      formData: {
        routingNo: "",
        accountNo: "",
        investorPurpose: "",
        employmentStatus: "",
        employer: "",
        occupation: "",
        companyName: "",
        position: "",
        companySymbol: "",
        affliatedPerson: "",
        companyName2: "",
        position2: "",
        affliatedPerson2: "",
      },
    };
    props.plaidSetup(this.props.signData.hash);
    window.scrollTo(0, 0);
  }

  componentDidMount() {
    if (this.props.allSignData.step2.citizenship == "United States") {
      EventBus.on("AccountDetails", () => this.setState({ isDisabled: false }));
      if (
        this.props.allSignData.step3 &&
        Object.keys(this.props.allSignData.step3).length > 0
      ) {
        const { formData } = this.state;
        let myStep = this.props.allSignData.step3;
        formData["accountType"] = myStep.accountType;
        formData["bankName"] = myStep.bankName;
        formData["routingNo"] = myStep.routingNo;
        formData["accountNo"] = myStep.accountNo;
        formData["confirmAccountNumber"] = myStep.accountNo;
        if (this.props.allSignData.step3.hasOwnProperty("accountNo")) {
          this.setState({ plaidCheck: false, manualCheck: true });
        }
        this.setState({ formData });
      }
      ReactGA.pageview("/signup-account-details");
    } else {
      this.skipAccounts();
    }
  }

  // eslint-disable-next-line no-unused-vars
  onSuccess = (public_token, metadata) => {
    this.setState({ isDisabled: true });
    metadata["hash"] = this.props.signData.hash;
    this.props.plaidUpload(metadata);
    // axios.post("/auth/public_token", {public_token});
    // EventBus.publish("success", `Successfully attached Bank Account!`);
  };

  handleAddBank = () => {
    const { formData } = this.state;
    formData["hash"] = this.props.signData.hash;
    if (
      this.state.formData.confirmAccountNumber != this.state.formData.accountNo
    ) {
      EventBus.publish("error", `Account Number is not same.`);
      this.setState({ accountsMatched: false });
    } else {
      if (this.state.isValidName) {
        this.props.signAddBank(formData);
        this.setState({ isDisabled: true });
      }
    }
  };

  skipAccounts = () => {
    this.setState({ isDisabled: true });
    this.props.signSkipBank(this.props.signData.hash);
  };

  handleFormChange = (event) => {
    const { formData } = this.state;
    formData[event.target.name] = event.target.value;
    this.setState({ formData });
    if (event.target.name == "routingNo") {
      let isRoutingValid =
        brnv.ABARoutingNumberIsValid(event.target.value) &&
        event.target.value.length === 9;
      this.setState({ isRoutingValid: isRoutingValid });
    } else if (event.target.name == "bankName") {
      if (
        event.target.value !== "" &&
        event.target.value !== undefined &&
        !/[^a-zA-Z ]/.test(event.target.value)
      )
        this.setState({ isValidName: true });
      else this.setState({ isValidName: false });
    }
  };

  handleAccountMatch = () => {
    if (
      this.state.formData.confirmAccountNumber != this.state.formData.accountNo
    ) {
      this.setState({ accountsMatched: false });
    } else {
      this.setState({ accountsMatched: true });
    }
  };

  handleCheckManual = (event) => {
    if (event.target.value == "true") {
      this.setState({ manualCheck: false, plaidCheck: false });
    } else this.setState({ manualCheck: true, plaidCheck: false });
  };

  handleCheckPlaid = (event) => {
    if (event.target.value == "true") {
      this.setState({ plaidCheck: false, manualCheck: false });
    } else {
      this.setState({ plaidCheck: true, manualCheck: false });
    }
  };

  // ins_1000000
  goBack = () => this.props.onBack(2);

  handleChange = (e) => {
    e.preventDefault();
  };

  render() {
    let { plaidDataSignUp } = this.props;
    return (
      <div className="signUp-form">
        <div className="basic-Info-1">
          <div className="content-area">
            <h1 className="title">Account Details</h1>
            <Steps step={3} />
            <h5 className="heading">Risk Profile:</h5>
            <div className="risk-profile-container">
              <ValidatorForm className="validatorForm">
                <div className="col-sm-12 col-md-12 col-lg-12 pt-3 select-container">
                  <InputLabel htmlFor="outlined-age-native-simple">
                    Investor Purpose
                  </InputLabel>
                  <Select
                    native
                    // error={!this.state.isValidState}
                    disabled={this.state.lockFields}
                    labelWidth={this.state.labelWidth - 40}
                    type="text"
                    name="investorPurpose"
                    value={this.state.formData.investorPurpose}
                    onChange={this.handleFormChange}
                    validators={["required"]}
                    autoComplete="off"
                  >
                    <option
                      value="preservationOfCapital"
                      className="pl-2 selectOptions"
                    >
                      Preservation of capital
                    </option>
                    <option value="income" className="pl-2 selectOptions">
                      Income
                    </option>
                    <option
                      value="capitalAppreciation"
                      className="pl-2 selectOptions"
                    >
                      Capital appreciation
                    </option>
                    <option value="speculation" className="pl-2 selectOptions">
                      Speculation
                    </option>
                    <option
                      value="tradingProfits"
                      className="pl-2 selectOptions"
                    >
                      Trading Profits
                    </option>
                  </Select>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-12 pt-3 select-container">
                  <InputLabel htmlFor="outlined-age-native-simple">
                    Are you ok trading low trade volume (illiquid) securities?
                  </InputLabel>
                  <Select
                    native
                    // error={!this.state.isValidState}
                    disabled={this.state.lockFields}
                    labelWidth={this.state.labelWidth - 40}
                    type="text"
                    name="isTradingLowSecurities"
                    value={this.state.isTradingLowSecurities}
                    onChange={() =>
                      this.setState({
                        isTradingLowSecurities:
                          !this.state.isTradingLowSecurities,
                      })
                    }
                    validators={["required"]}
                    autoComplete="off"
                  >
                    <option value="true" className="pl-2 selectOptions">
                      Yes
                    </option>
                    <option value="false" className="pl-2 selectOptions">
                      No
                    </option>
                  </Select>
                </div>
                {this.state.isTradingLowSecurities && (
                  <>
                    <h5 className="heading">Investor Association: </h5>
                    <span>
                      Please read the options below and check the boxes that
                      apply. After checking a box, please provide all the
                      additional information that is requested.
                    </span>
                    <br />
                    <FormControlLabel
                      checked={this.state.isFamilyMember}
                      value={this.state.isFamilyMember}
                      onChange={() =>
                        this.setState({
                          isFamilyMember: !this.state.isFamilyMember,
                        })
                      }
                      className="formHeading"
                      control={<Checkbox color="primary" />}
                      label="I or an immediate family member (i.e. spouse, children, mother, brother sister or other family members living in your household) is, or in the past 3 months has been, a director, 10% shareholder or a senior officer of a publicly traded company or of any other company whose securities are quoted on AKRU."
                      labelPlacement="end"
                      errorMessages={["Please Select one"]}
                      name="investorAssociation"
                    />
                    {this.state.isFamilyMember && (
                      <div className="form-container">
                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Name of Company"
                            onChange={this.handleFormChange}
                            name="companyName"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={["Company Name cannot be empty"]}
                            value={this.state.formData.companyName}
                          />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Position of Affliated Person"
                            onChange={this.handleFormChange}
                            name="position"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={["Position cannot be empty"]}
                            value={this.state.formData.position}
                          />
                        </div>

                        <div className="col-sm-12 col-md-12 col-lg-6 pt-3 select-container">
                          <InputLabel htmlFor="outlined-age-native-simple">
                            Company Symbol
                          </InputLabel>
                          <Select
                            native
                            // error={!this.state.isValidState}
                            disabled={this.state.lockFields}
                            labelWidth={this.state.labelWidth - 40}
                            type="text"
                            name="companySymbol"
                            value={this.state.formData.companySymbol}
                            onChange={this.handleFormChange}
                            validators={["required"]}
                            autoComplete="off"
                          >
                            <option value="aspd" className="pl-2 selectOptions">
                              ASPD
                            </option>
                            <option value="curz" className="pl-2 selectOptions">
                              CURZ
                            </option>
                            <option value="exod" className="pl-2 selectOptions">
                              EXOD
                            </option>
                            <option value="myra" className="pl-2 selectOptions">
                              MYRA
                            </option>
                            <option
                              value="tzrop"
                              className="pl-2 selectOptions"
                            >
                              TZROP
                            </option>
                            <option
                              value="zvzzt"
                              className="pl-2 selectOptions"
                            >
                              ZVZZT
                            </option>
                          </Select>
                        </div>

                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Name of Affiliated Person"
                            onChange={this.handleFormChange}
                            name="affliatedPerson"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={[
                              "Affiliated Person cannot be empty",
                            ]}
                            value={this.state.formData.affliatedPerson}
                          />
                        </div>
                      </div>
                    )}
                    <FormControlLabel
                      checked={this.state.isFinraEmployed}
                      value={this.state.isFinraEmployed}
                      onChange={() =>
                        this.setState({
                          isFinraEmployed: !this.state.isFinraEmployed,
                        })
                      }
                      className="formHeading"
                      control={<Checkbox color="primary" />}
                      label="I am (or member of my immediate family is) employed by or associated with a member firm of a stock exchange or FINRA or are employed by FINRA."
                      labelPlacement="end"
                      errorMessages={["Please Select one"]}
                      name="investorAssociation"
                    />
                    {this.state.isFinraEmployed && (
                      <div className="form-container">
                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Name of Company"
                            onChange={this.handleFormChange}
                            name="companyName"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={["Company Name cannot be empty"]}
                            value={this.state.formData.companyName2}
                          />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Position of Affliated Person"
                            onChange={this.handleFormChange}
                            name="position"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={["Position cannot be empty"]}
                            value={this.state.formData.position2}
                          />
                        </div>

                        <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                          <TextValidator
                            className="MyTextField"
                            fullWidth
                            inputProps={{ maxLength: 20 }}
                            label="Name of Affiliated Person"
                            onChange={this.handleFormChange}
                            name="affliatedPerson"
                            // error={!this.state.isValidName}
                            type="text"
                            margin="dense"
                            variant="outlined"
                            validators={["required"]}
                            errorMessages={[
                              "Affiliated Person cannot be empty",
                            ]}
                            value={this.state.formData.affliatedPerson2}
                          />
                        </div>
                      </div>
                    )}

                    <h5 className="heading">Employment:</h5>
                    <div className="col-sm-12 col-md-12 col-lg-12 pt-3">
                      <div className="select-container">
                        <InputLabel htmlFor="outlined-age-native-simple">
                          Employment Status
                        </InputLabel>
                        <Select
                          native
                          // error={!this.state.isValidState}
                          disabled={this.state.lockFields}
                          labelWidth={this.state.labelWidth - 40}
                          type="text"
                          name="employmentStatus"
                          value={this.state.formData.employmentStatus}
                          onChange={this.handleFormChange}
                          validators={["required"]}
                          autoComplete="off"
                        >
                          <option
                            value=""
                            className="pl-2 selectOptions"
                          ></option>
                          <option
                            value="employed"
                            className="pl-2 selectOptions"
                          >
                            Employed
                          </option>
                          <option
                            value="unemployed"
                            className="pl-2 selectOptions"
                          >
                            Unemployed
                          </option>
                          <option
                            value="retired"
                            className="pl-2 selectOptions"
                          >
                            Retired
                          </option>
                          <option
                            value="student"
                            className="pl-2 selectOptions"
                          >
                            Student
                          </option>
                        </Select>
                      </div>
                      {this.state.formData.employmentStatus === "employed" && (
                        <div
                          className="employed-fields"
                          style={{ display: "flex" }}
                        >
                          <div className="col-sm-12 col-md-12 col-lg-6 pt-3 pr-2">
                            <TextValidator
                              className="MyTextField"
                              fullWidth
                              inputProps={{ maxLength: 20 }}
                              label="Employer Name"
                              onChange={this.handleFormChange}
                              name="employer"
                              // error={!this.state.isValidName}
                              type="text"
                              margin="dense"
                              variant="outlined"
                              validators={["required"]}
                              errorMessages={["Employer Name cannot be empty"]}
                              value={this.state.formData.employer}
                            />
                          </div>

                          <div className="col-sm-12 col-md-12 col-lg-6 pt-3 pl-2">
                            <TextValidator
                              className="MyTextField"
                              fullWidth
                              inputProps={{ maxLength: 20 }}
                              label="Occupation"
                              onChange={this.handleFormChange}
                              name="occupation"
                              // error={!this.state.isValidName}
                              type="text"
                              margin="dense"
                              variant="outlined"
                              // validators={["required"]}
                              // errorMessages={["Occupation cannot be empty"]}
                              value={this.state.formData.occupation}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </ValidatorForm>
            </div>

            <div className="col-12">
              <ValidatorForm className="validatorForm">
                <div className="row">
                  <div className="col-12">
                    <FormControlLabel
                      checked={this.state.plaidCheck}
                      value={this.state.plaidCheck}
                      onChange={() =>
                        this.setState({
                          plaidCheck: !this.state.plaidCheck,
                          manualCheck: false,
                        })
                      }
                      className="formHeading"
                      control={<Checkbox color="primary" />}
                      label="Connect your bank automatically"
                      labelPlacement="end"
                      errorMessages={["Please agree to the terms"]}
                      name="plaidCheck"
                    />
                  </div>
                  {this.state.plaidCheck ? (
                    <div className="row pl-3 pr-3">
                      {plaidDataSignUp["link_token"] && (
                        <>
                          <div className="col-6 col-md-4 pb-3">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/bank-of-america.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/chase.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/wells-fargo.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 pb-3">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/ally-sm2.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/usaa.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/pnc.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 pb-3">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/citi.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/charles-schwab.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/td.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4 pb-3">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/usbank2.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="plaidBoxes">
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <a className="pt-1">
                                  <img
                                    height={100}
                                    width={100}
                                    src="https://tknismtest.s3.amazonaws.com/non-compressed-images/navy-federal.svg"
                                    alt=""
                                  />
                                </a>
                              </PlaidLink>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div
                              className="plaidBoxes"
                              style={{ height: 100, paddingTop: "30px" }}
                            >
                              <PlaidLink
                                token={plaidDataSignUp["link_token"]}
                                onExit={this.onExit}
                                onSuccess={this.onSuccess}
                                type="button"
                                style={{ border: "0px !important" }}
                              >
                                <i className="fa fa-search"></i>{" "}
                                <span>Search</span>
                              </PlaidLink>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </ValidatorForm>
            </div>
            <div className="col-12">
              <ValidatorForm
                className="validatorForm"
                onSubmit={(value) => this.handleAddBank(value)}
                autoComplete="off"
              >
                <div className="row">
                  {this.state.manualCheck ? (
                    <div className="row">
                      <div className="col-12 pt-3">
                        <FormControl
                          variant="outlined"
                          label="Account Type"
                          margin="dense"
                          className="MyTextField"
                          fullWidth
                        >
                          <InputLabel htmlFor="outlined-age-native-simple">
                            Account Type
                          </InputLabel>
                          <Select
                            labelWidth={97}
                            type="text"
                            name="accountType"
                            value={this.state.formData.accountType}
                            onChange={this.handleFormChange}
                          >
                            <li value="savings" className="p-2 selectOptions">
                              Savings
                            </li>
                            <li value="checking" className="p-2 selectOptions">
                              Checking
                            </li>
                          </Select>
                        </FormControl>
                      </div>

                      <div className="col-12 pt-3">
                        <TextValidator
                          className="MyTextField"
                          fullWidth
                          inputProps={{ maxLength: 20 }}
                          label="Bank Name"
                          onChange={this.handleFormChange}
                          name="bankName"
                          error={!this.state.isValidName}
                          type="text"
                          margin="dense"
                          variant="outlined"
                          validators={["required"]}
                          errorMessages={["Bank Name cannot be empty"]}
                          value={this.state.formData.bankName}
                        />
                      </div>

                      <div className="col-12 pt-3">
                        <TextValidator
                          className="MyTextField"
                          fullWidth
                          inputProps={{ maxLength: 20 }}
                          label="Routing Number"
                          onChange={this.handleFormChange}
                          name="routingNo"
                          type="number"
                          margin="dense"
                          variant="outlined"
                          validators={["required"]}
                          errorMessages={["Routing Number cannot be empty"]}
                          value={this.state.formData.routingNo}
                        />
                        {!this.state.isRoutingValid ? (
                          <span className="errorMessage">
                            Routing number not valid
                          </span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="col-12 pt-3">
                        <TextValidator
                          autoComplete="off"
                          className="MyTextField"
                          fullWidth
                          inputProps={{ minLength: 10, maxLength: 20 }}
                          label="Account Number"
                          onChange={this.handleFormChange}
                          onBlur={this.handleAccountMatch}
                          name="accountNo"
                          type="number"
                          margin="dense"
                          variant="outlined"
                          validators={["required"]}
                          errorMessages={["Account Number cannot be empty"]}
                          value={this.state.formData.accountNo}
                          onCut={this.handleChange}
                          onCopy={this.handleChange}
                          onPaste={this.handleChange}
                        />
                      </div>

                      <div className="col-12 pt-3">
                        <TextValidator
                          autoComplete="off"
                          onpaste="return false;"
                          className="MyTextField"
                          fullWidth
                          inputProps={{ minLength: 10, maxLength: 20 }}
                          label="Confirm Account Number"
                          onChange={this.handleFormChange}
                          onBlur={this.handleAccountMatch}
                          name="confirmAccountNumber"
                          type="number"
                          margin="dense"
                          variant="outlined"
                          validators={["required"]}
                          errorMessages={[
                            "Confirm Account Number cannot be empty",
                          ]}
                          value={this.state.formData.confirmAccountNumber}
                          onCut={this.handleChange}
                          onCopy={this.handleChange}
                          onPaste={this.handleChange}
                        />
                        {!this.state.accountsMatched ? (
                          <span className="errorMessage">
                            Account Number is not same.
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="row justify-content-between">
                  <div className="col-3 pt-3">
                    <div className="loginBtnDiv">
                      <div className="outer-box">
                        <button
                          type="button"
                          name="skipButton"
                          value="skipButton"
                          onClick={() => this.goBack()}
                          className="mr-1 secondry-btn"
                          disabled={this.state.isDisabled}
                        >
                          {!this.state.isDisabled ? (
                            "Back"
                          ) : (
                            <i className="fa fa-spinner fa-spin fa-1x fa-fw" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-3 pt-3">
                    <div className="loginBtnDiv">
                      <div className="outer-box">
                        <button
                          type="button"
                          name="skipButton"
                          value="skipButton"
                          onClick={(value) => this.skipAccounts(value)}
                          className="primary-btn mr-1"
                          disabled={this.state.isDisabled}
                        >
                          {!this.state.isDisabled ? (
                            "Next"
                          ) : (
                            <i className="fa fa-spinner fa-spin fa-1x fa-fw" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {this.state.manualCheck && (
                    <div className="col-3 pt-3">
                      <div className="loginBtnDiv">
                        <div className="outer-box">
                          <button
                            type="submit"
                            name="submitButton"
                            value="submitButton"
                            className="primary-btn mr-1"
                            disabled={this.state.isDisabled}
                          >
                            {!this.state.isDisabled ? (
                              "Continue"
                            ) : (
                              <i className="fa fa-spinner fa-spin fa-1x fa-fw" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ValidatorForm>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ Auth }) => {
  let { plaidDataSignUp, auth } = Auth;
  return {
    auth,
    plaidDataSignUp,
    allSignData: Auth.signData,
    signData: Auth.signData ? Auth.signData.info : [],
  };
};

const mapDispatchToProps = {
  signAddBank,
  logout,
  plaidUpload,
  signSkipBank,
  plaidSetup,
};
export default connect(mapStateToProps, mapDispatchToProps)(AccountDetails);
