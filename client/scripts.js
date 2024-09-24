//********************************************************************************************************************************************************/
// Magic: The Gathering - Batch Event Manager - Reporting client
// Author.: Slanfan Development (Mattias Berggren)
// Version: 1.0.14
// Date...: 2024.09.03
//********************************************************************************************************************************************************/

angular.module('reportingApp', [])

.controller('ReporterController', function($scope) {
    var app = this;

    app.tournament = {}
    app.tournamentSelected = false
    app.tableFilter = ''
    app.disableEnterButton = true
    app.selectedMatch = undefined
    app.matchReportingStep = 1
    app.reportSlip = {
        player1: 0,
        player2: 0,
        draws: 0,
        step: 1,
        winner: '',
    }

    // connect to the web socket server
    app.socket = new WebSocket(`ws://${window.location.hostname}:5001`)
    // Connection opened
    app.socket.addEventListener('open', function (event) {
        console.log('Connected to WebSocket server');
        
        // Example: Send a message when connected
        app.socket.send(JSON.stringify({
            type: 'init',
            data: {},
            message: 'Hello from Client',
            origin: 'client'
        }));
    });
    // Listen for messages
    app.socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data)
        if (data.origin === 'admin') {
            console.log('Message from admin:', data);
            switch (data.type) {
                case 'pairings-created':
                    console.log('...pairings received', data.data)
                    app.tournament = data.data || {}
                    app.tournamentSelected = data.data && data.data.id
                    $scope.$digest()
                    break
                case 'select-tournament':
                    console.log('...tournament selected', data.data)
                    app.tournament = data.data || {}
                    app.tournamentSelected = data.data && data.data.id
                    $scope.$digest()
                    break
                case 'close-tournament':
                    console.log('...tournament closed')
                    app.tournament = {}
                    app.tournamentSelected = false
                    $scope.$digest()
                    break
                default:
                    break
            }
        }
    });
    app.socket.addEventListener('error', function (error) {
        console.error('WebSocket Error:', error);
    });
    app.socket.addEventListener('close', function (event) {
        console.log('WebSocket connection closed:', event);
    });

    app.tourneySelected = () => {
        return app.tournament && app.tournament.id
    }

    app.enterNumber = (number) => {
        let current = app.tableFilter
        if (current.length === 4) {
            return
        }
        current = current + number
        app.tableFilter = current
        app.setEnterButtonState()
    }

    app.clearNumber = () => {
        let current = app.tableFilter
        current = current.substring(0, current.length - 1)
        app.tableFilter = current
        app.setEnterButtonState()
    }
        
    app.setEnterButtonState = () => {
        console.log('setting button state')
        const tableNumber = parseInt(app.tableFilter)
        const match = app.tournament.batches[app.tournament.batches.length - 1].matches.find(i => i.tableNumber === tableNumber)
        app.disableEnterButton = match === undefined
    }

    app.loadMatch = () => {
        const tableNumber = parseInt(app.tableFilter)
        const match = app.tournament.batches[app.tournament.batches.length - 1].matches.find(i => i.tableNumber === tableNumber)
        app.resetReportSlip()
        app.selectedMatch = match
        app.tableFilter = ''
        console.log('Match loaded', match)
    }

    app.resetReportSlip = () => {
        app.reportSlip = {
            player1: 0,
            player2: 0,
            draws: 0,
            step: 1,
            winner: '',
            winnerResult: 0,
            loserResult: 0,
        }
    }

    app.reportSlipNext = () => {
        app.reportSlip.step++
        if (app.reportSlip.step === 4) {
            app.reportSlipUpdateWinner()
        }
    }

    app.reportSlipPrev = () => {
        app.reportSlip.step--
    }

    app.reportSlipDecreaseGWP1 = () => {
        app.reportSlip.player1--
    }

    app.reportSlipIncreaseGWP1 = () => {
        app.reportSlip.player1++
    }

    app.reportSlipDecreaseGWP2 = () => {
        app.reportSlip.player2--
    }

    app.reportSlipIncreaseGWP2 = () => {
        app.reportSlip.player2++
    }

    app.reportSlipDecreaseDraws = () => {
        app.reportSlip.draws--
    }

    app.reportSlipIncreaseDraws = () => {
        app.reportSlip.draws++
    }

    app.reportSlipToStep = (step) => {
        app.reportSlip.step = step
        if (app.reportSlip.step === 4) {
            app.reportSlipUpdateWinner()
        }
    }

    app.reportSlipUpdateWinner = () => {
        app.reportSlip.winner = app.reportSlip.player1 === app.reportSlip.player2
                ? 'draw'
                : app.reportSlip.player1 > app.reportSlip.player2
                    ? 'player1'
                    : 'player2'
            app.reportSlip.winnerResult = app.reportSlip.player1 === app.reportSlip.player2
                ? app.reportSlip.player1
                : app.reportSlip.player1 > app.reportSlip.player2
                    ? app.reportSlip.player1
                    : app.reportSlip.player2
            app.reportSlip.loserResult = app.reportSlip.player1 === app.reportSlip.player2
            ? app.reportSlip.player2
            : app.reportSlip.player2 > app.reportSlip.player1
                ? app.reportSlip.player1
                : app.reportSlip.player2
    }

    app.cancelReporting = () => {
        app.resetReportSlip()
        app.selectedMatch = undefined
    }

    app.reportSlipSubmit = () => {
        app.selectedMatch.isDraw = app.reportSlip.winner === 'draw'
        app.selectedMatch.isReported = true
        app.selectedMatch.player1.gameDrawn = app.reportSlip.draws
        app.selectedMatch.player1.gameWins = app.reportSlip.player1
        app.selectedMatch.player1.winner = app.reportSlip.winner === 'player1'
        app.selectedMatch.player2.gameDrawn = app.reportSlip.draws
        app.selectedMatch.player2.gameWins = app.reportSlip.player2
        app.selectedMatch.player2.winner = app.reportSlip.winner === 'player2'
        console.log('Result reported -> ', app.selectedMatch)

        // Example: Send a message when connected
        app.socket.send(JSON.stringify({
            type: 'match-result',
            data: app.selectedMatch,
            message: 'Match result incoming from client',
            origin: 'client',
        }));
        app.cancelReporting()
    }

});
