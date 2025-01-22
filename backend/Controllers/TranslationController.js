import axios from 'axios';


export const getLanguages = async(req, res)=>{
  try {
    const result = await axios.get("https://libretranslate.com/languages");
    console.log(result);
    res.status(200).json(result.data)
  } catch (error) {
    res.status(200).json({error})
  }
}