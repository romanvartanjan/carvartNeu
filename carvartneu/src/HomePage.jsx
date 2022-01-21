import React, { Component } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { FormControl, Select, InputLabel } from '@material-ui/core';

class HomePage extends React.Component {

  state;
  aOptionsMark = []
  aOptionsModel = []
  aOptionsFuel = ["Benzin", "Diesel"]
  aOptionsFirstRegestration = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
   2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
  aOptionsPriceFrom = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000,
   8000, 9000,  10000, 11000, 12000, 13000, 14000, 15000, 17500, 20000, 22500, 25000,
   27500, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000]
  aOptionsPriceTo = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000,
  8000, 9000,  10000, 11000, 12000, 13000, 14000, 15000, 17500, 20000, 22500, 25000,
  27500, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000]

  constructor(props) {
    super(props);
    this.state = {
        sMake: String,
        sModel: String,
        iPriceFrom: Number,
        iPriceTo: Number,
        iFirstRegistration: Number,
        sFuelType: String,
    };
    this.getMakes();
  }

  // Die handleChange Funktionen ändern den Wert einer Variable im State
  // sobald diese im Select gewählt wird 

  handleChangeMake = sMake => event => {
    const sMakee = this.aOptionsMark[event.target.value -1].make;
    this.setState({
        ...this.state,
        [sMake]: event.target.value,
    });
    this.aOptionsModel = []
    this.getModels(sMakee)
  };    

  handleChangeModel = model => event => {
    this.setState({
        ...this.state,
        [model]: event.target.value,
    });
  };

  handleChangePriceFrom = iPriceFrom => event => {
    this.setState({
        ...this.state,
        [iPriceFrom]: event.target.value,
    });
  };

  handleChangePriceTo =  iPriceTo => event => {
    this.setState({
        ...this.state,
        [iPriceTo]: event.target.value,
    });
    console.log(this.state.iPriceTo);
  };

  handleChangeFirstRegestration = iFirstRegistration => event => {
    console.log(event.target.value);
    this.setState({
        ...this.state,
        [iFirstRegistration]: event.target.value,
    });
    console.log(this.state.iFirstRegistration);
  };

  handleChangeFuelType = sFuelType => event => {
    this.setState({
        ...this.state,
        [sFuelType]: event.target.value,
    });
  };

  getMakes = async () => {
    const http = axios.create({
      baseURL: "http://192.168.1.179:5000"
    });
    const data = await http.get("/getMakes")
    .then(response => { 
      console.log(response.data[0].arrayLength);
      let i = 0;
      while (i < response.data[0].arrayLength) {
        this.aOptionsMark.push({
            "id": response.data[i].id,
            "make": response.data[i].make,
            "idOnMobile": response.data[i].idOnMobile,
        });
        i += 1; 
    }
    this.forceUpdate()
    })
    .catch(error => {
        console.log(error.response);
        alert(error.response.data);
    });
  }

  getModels = async (sMake) => {
    const http = axios.create({
      baseURL: "http://192.168.1.179:5000"
    });
    const data = await http.get("/getModels", {
        params: {
            sMake: sMake
        }
    })
    console.log(data.data.length);
    let i = 0;
    while (i < data.data.length) {
      this.aOptionsModel.push({
          "id": data.data[i].id,
          "model": data.data[i].model,
          "idOnMobile": data.data[i].idOnMobile,
      });
      i += 1; 
    }
    this.forceUpdate()
  }

/*Gibt die Ausgewählten Suchkriterien an das Backend, damit es da dann mit
Hilfe von puppeteer bei Mobile.de eingetippt werden kann, um die jeweiligen 
Autos zu finden */
onClickGetCarsFromMobile = async () => {
  const http = axios.create({
      baseURL: "http://192.168.1.179:5000"
  });
  console.log(this.state.iFirstRegistration);
  const test = await http.get("/getCarsFromMobile", {
    params: {
      make: this.aOptionsMark[this.state.sMake -1].idOnMobile,
      model: this.aOptionsModel[this.state.sModel - 1].idOnMobile,
      priceFrom: this.state.iPriceFrom,
      priceTo: this.state.iPriceTo,
      firstRegistration: this.state.iFirstRegistration,
      fuelType: this.state.sFuelType,
    }
  })
  .then(response => { 
      console.log("kommt bei then an")
  })
  .catch(error => {
      console.log(error.response);
      alert(error.response.data);
  });
}

// Diese Funktion ist nur Zwischenzeitlich da, um die Marken von Mobile auszulesen
onClickSaveMakes = async () => {
  const http = axios.create({
      baseURL: "http://192.168.1.179:5000"
  });
  const test = await http.get("/saveMakesss", {})
  .then(response => { 
      console.log("Marken erflfgreidh in Datenbank gespeichert");
  })
  .catch(error => {
      console.log(error.response);
      alert(error.response.data);
  });
}

  render() {
    return(
      <div style={{ margin: "auto", width: "50%"}}>
          <Grid container  mx="auto" justify="center" style={{ color: "black", backgroundcolor: "white"}} >
              <Grid item xs={10} xl={12}>
              <h1 style={{textAlign: "center"}}>
                  Search for new Cars
              </h1> 
                  <FormControl style={{width: "46%", margin: "2%"}}>
                    <InputLabel >Make</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.sMake}
                          onChange={this.handleChangeMake('sMake')}
                          inputProps={{
                            make: 'sMake'
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsMark.map((value) => {
                              return <option value={value.id}>{value.make}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <FormControl style={{width: "46%", margin: "2%"}}>
                      <InputLabel >Model</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.sModel}
                          onChange={this.handleChangeModel('sModel')}
                          inputProps={{
                            model: 'sModel',
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsModel.map((value) => {
                              return <option value={value.id}>{value.model}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <FormControl style={{width: "46%", margin: "2%"}}>
                    <InputLabel >Price from</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.iPriceFrom}
                          onChange={this.handleChangePriceFrom('iPriceFrom')}
                          inputProps={{
                            pricefrom: 'iPriceFrom',
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsPriceFrom.map((value) => {
                                return <option value={value}>{value + " €"}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <FormControl style={{width: "46%", margin: "2%"}}>
                      <InputLabel >Price to</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.iPriceTo}
                          onChange={this.handleChangePriceTo('iPriceTo')}
                          inputProps={{
                            priceto: 'iPriceTo',
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsPriceTo.map((value) => {
                                return <option value={value}>{value + " €"}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <FormControl style={{width: "46%", margin: "2%"}}>
                    <InputLabel >Firt Registration</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.iFirstRegistration}
                          onChange={this.handleChangeFirstRegestration('iFirstRegistration')}
                          inputProps={{
                            firstregistration: 'iFirstRegistration',
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsFirstRegestration.map((value) => {
                                return <option value={value}>{value}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <FormControl style={{width: "46%", margin: "2%"}}>
                      <InputLabel >Fuel Type</InputLabel>
                      <Select
                          native
                          style={{width: "100%"}}
                          value={this.state.sFuelType}
                          onChange={this.handleChangeFuelType('sFuelType')}
                          inputProps={{
                            fueltype: 'sFuelType',
                          }}
                      >
                        <option ></option>
                        {
                            this.aOptionsFuel.map((value) => {
                                return <option value={value}>{value}</option>
                            })
                        }
                      </Select>
                  </FormControl>
                  <Button style={{width: "100%", marginTop: "30px"}} variant="contained" color="primary" onClick={this.onClickGetCarsFromMobile} >
                    Get Cars from Mobile
                  </Button>
                  <Button style={{width: "100%", marginTop: "30px"}} variant="contained" color="primary" onClick={this.onClickSaveMakes} >
                    Save makes
                  </Button>
              </Grid>
          </Grid>
      </div> 
      //<Button variant="contained" onClick={this.onClickSearch}>Search</Button>
    )
  }
}

export default HomePage;
