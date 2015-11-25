import React from 'react';
import ApiService from '../../services/ApiService';
let apiService = new ApiService();

class StoreAddress extends React.Component {

	constructor() {
		super();
		this.state = {
			store:null
		}
	}

	componentDidMount(){
        apiService.getStoreDetails(this.props.store_code).end((err, res)=>{
            if (res.ok) {
                this.setState({
                    store:res.body
                });
            }
        });
	}

	render(){
		return (
			<div>
                <p>{this.state.store && this.state.store.other_name}</p>
                <p className="address">
                    {this.state.store && this.state.store.contact.address1 &&
                        <span className="road">{this.state.store.contact.address1}</span>
                    }
                    {this.state.store && this.state.store.contact.address2 &&
                        <span>{this.state.store.contact.address2},</span>
                    }
                    {this.state.store && this.state.store.contact.city &&
                        <span>{this.state.store.contact.city},</span>
                    }
                    {this.state.store && this.state.store.contact.post_code &&
                        <span>{this.state.store.contact.post_code}</span>
                    }
                </p>
            </div>
		)
	}
}

export default StoreAddress;
