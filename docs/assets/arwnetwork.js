
document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("arweaveWalletLoaded", () => {

      var connect = window.arweaveWallet.connect
      var disconnect = window.arweaveWallet.disconnect
      var permissions = window.arweaveWallet.getPermissions
      var address = window.arweaveWallet.getActiveAddress
      var sign = window.arweaveWallet.sign

      var permissionarray = ['ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES', 'SIGN_TRANSACTION']

      var buttonconnect = document.getElementById('connect')
      var buttondisconnect = document.getElementById('disconnect')
      var workingpanel = document.getElementById('tryit')
      var startbtn = document.getElementById('startbtn')
      var greeting = document.getElementById('greeting')

      var handlePermissions = async () => {
        var result = await permissions()
        return result
      }

      buttonconnect.addEventListener('click', async () => {

        var result = await handlePermissions()
        if (result.length > 0) {
          buttonconnect.innerText = 'CONNECTED'
          buttondisconnect.removeAttribute('style')
          buttonconnect.disabled = true
          buttonconnect.style.backgroundColor = 'green'
          workingpanel.hidden = false
          startbtn.removeAttribute('style')


          walletdir = await address()
          greeting.innerText = `Hi... ${walletdir} .... pixel4te!`

        }
        if (result.length == 0) {
          await connect(permissionarray)
          buttonconnect.innerText = 'CONNECTED'
          buttondisconnect.removeAttribute('style')
          buttonconnect.disabled = true
          buttonconnect.style.backgroundColor = 'green'
          workingpanel.hidden = false
          startbtn.removeAttribute('style')


          walletdir = await address()
          greeting.innerText = `Hi... ${walletdir} .... pixel4te!`
        }

      });
      buttondisconnect.addEventListener('click', async () => {
        disconnect()
        buttonconnect.innerText = 'CONNECT WALLET'
        buttonconnect.removeAttribute('style')
        buttonconnect.disabled = false
        buttondisconnect.style.display = 'none'
        workingpanel.hidden = true
        startbtn.style.display = 'none'

        greeting.innerText = ''

      });


  });
  window.addEventListener("walletSwitch", async (e) => {
    const walletdir = e.detail.address;
    let getBalance = async () => {
      var adress1 = await window.arweaveWallet.getActiveAddress()
      var balance = await arweave.wallets.getBalance(adress1)
      var balanceInAr = arweave.ar.winstonToAr(balance);
      return balanceInAr
    }
    greeting.innerText = `Hi... ${walletdir} .... pixel4te!`
    balanceInAr = await getBalance()
    if (balanceInAr < 0.02) {
      document.querySelector('#downloadimage').disabled = true;
      document.getElementById('balancefalse').innerText = `Insufficient Balance | ${balanceInAr}`
    } else {
      document.querySelector('#downloadimage').disabled = false;
      document.getElementById('balancefalse').innerText = `Balance | ${balanceInAr}`
    }
  });

})
