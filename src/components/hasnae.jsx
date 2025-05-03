import React ,{useState} from 'react'; 
import web3 from web3;
import DoctorRegistsration from "../build/constracts/DoctorRegistration.json";


const DoctorLogin = () =>{

    const navigate=useNavigate();
    const [hhNumberError , sethhNumberError]=useState("");
    const [hhNumber, sethhNumber]= useState("");
    const [password, setPassword]=useState("");


    const web3 = new Web3(window.ethereum);
    const networdId= await web3.eth.net.getId();
    const deployedNetword=DoctorRegistartion.net
    return(
        <div classNmame="doctor-login-container">
            <NavBar/>
            <div className="login-form-warpper">
                <h2 className="loginTitle">Connexion Medcin</h2>
                {errorMessage &&(
                    <div className="error-message mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {errorMessage}
                    </div>
                )}
                <div className="from-group">
                    <label  classNmame="form-label" htmlFor=" hhNumber"> 
                        Numero de sante de hopitale
                    </label>
                    <input 
                    id="hhNumber"
                    name="hhNumber" 
                    type="text"
                    className='form-input'
                    value={hhNumber}
                    onChange={handlhhNumberChange}
                    maxLength={6}                   
                    />
               
                </div>
                <div className="from-group">
                    <label className="form-label">
                        Mot de passe 
                    </label>
                    <input type="text" value={password} 
                    classNmae="form-input"
                    onChange={(e) => setPassword(e.target.value)}
                    required/>
                </div>
                <div classNmae="button-group">

                    <button onClick={handleChekRegistration}
                    className="doctor-login-buuton"
                    disabled={isLoading}>
                        {isLoading ? "connexion en cours ..." : "se connecter "}
                    </button>
                    <button onClick={()=> navigate("/")}
                        className="doctor-login-button cancel-button"
                        disabled={isLoading}>
                            Annuler
                    </button>
                </div>
            </div>

        </div>
    );
};